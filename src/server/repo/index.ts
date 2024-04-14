import { injectable, inject } from "inversify";
import "reflect-metadata";
import { ConfigType, DBType, IRepo, NoteType } from "../interface";
import type { IConfig, IDB, INoteDB, INoteFile } from "../interface";
import { getFiles } from "./files";
import path from "path/posix";
import { readFile, stat } from "node:fs/promises";
import { watch } from "node:fs";
import { INote } from "@/core/note";
import { fromSuccess } from "@/utils/errable";
import { getTimeDeduper } from "@/utils/debouncer";

@injectable()
export class RepoLive implements IRepo {
  @inject(ConfigType) private config!: IConfig;
  @inject(NoteType) private note!: INoteFile;
  @inject(DBType) private db!: IDB;
  public async dump() {
    await this.db.init();
    for (const [_, note] of await this.getIdToMeta()) {
      await this.db.updateNote(note);
    }
  }
  public async getNote(id: string) {
    return (await this.getIdToMeta()).get(id);
  }
  public async getHTML(id: string, document: boolean) {
    const idToMeta = await this.getIdToMeta();
    const metaRequest = idToMeta.get(id);
    if (!metaRequest) return "";
    const { notebookDir } = await this.config.getConfig();
    const fullPath = path.join(notebookDir, id);
    const contents = await readFile(fullPath, "utf8");
    return await this.note.getHTML(
      {
        id,
        idToMeta,
        document,
        untitled: "untitled",
      },
      contents,
    );
  }
  public async getNotes() {
    const entries: INote[] = [];
    for (const [_, note] of await this.getIdToMeta()) {
      entries.push(note);
    }
    return entries;
  }
  private idToMeta: Map<string, INote> | undefined;
  private async scanFile(
    id: string,
    cached: INoteDB | undefined,
    update: (id: string, note: INote) => void,
    remove?: (id: string) => void,
  ) {
    const { notebookDir } = await this.config.getConfig();
    const fullPath = path.join(notebookDir, id);
    try {
      const stats = await stat(fullPath);
      if (stats.isDirectory()) return 0;
      const { mtime } = stats;
      if (cached && cached.mtime === mtime.getTime()) {
        update(id, this.db.decode(cached));
        return 0;
      }
      const contents = await readFile(fullPath, "utf8");
      const noteReq = await this.note.getMeta(
        { id, mtime: mtime.getTime() },
        contents,
      );
      if (noteReq._tag === "success") {
        const note = fromSuccess(noteReq);
        update(id, note);
        await this.db.updateNote(note);
        return 1;
      }
      console.error("error in file %s: %s", id, noteReq.message);
      return 0;
    } catch (err) {
      remove?.(id);
      await this.db.deleteNote(id);
      return -1;
    }
  }
  private async getIdToMeta() {
    if (this.idToMeta) return this.idToMeta;
    const res = await this.scanDir();
    this.idToMeta = res;
    return res;
  }
  private async scanDir() {
    await this.db.init();
    const res = new Map<string, INote>();
    const cachedNotes = new Map<string, INoteDB>();
    for (const note of await this.db.getNotes()) {
      cachedNotes.set(note.id, note);
    }
    const start = Date.now();
    const { notebookDir, shouldWatch } = await this.config.getConfig();
    console.log("note directory: %s", notebookDir);
    let deletions = 0;
    const tasks: Promise<number>[] = [];
    const update = (id: string, note: INote) => res.set(id, note);
    const remove = (id: string) => res.delete(id);
    const cb = getTimeDeduper((id: string) => {
      console.log("%s touched", id);
      this.scanFile(id, undefined, update, remove);
    }, 1000);
    // setup the watcher first, as files can be touched before all notes have been scanned
    // FIXME: as of node v21.7.1 on linux, file or repo deletion triggers an exception
    // cf. https://github.com/nodejs/node/issues/49995
    if (shouldWatch)
      watch(
        notebookDir,
        { persistent: false, recursive: true },
        (_event, id) => {
          if (id === null) return;
          if (!this.note.shouldReadFile(id)) return;
          cb(id);
        },
      );
    // PERF: this is CPU bound (parsing the files), parallalizing file reading results in 8% speed gain
    // still doing it beacause code it is quite readable, however I do not think parallalizing directory iteration
    // worths it
    for await (const id of getFiles(notebookDir)) {
      if (!this.note.shouldReadFile(id)) continue;
      const cached = cachedNotes.get(id);
      tasks.push(this.scanFile(id, cached, update));
      cachedNotes.delete(id);
    }
    for (const id of cachedNotes.keys()) {
      deletions++;
      tasks.push(this.db.deleteNote(id).then(() => 0));
    }
    const updates = (await Promise.all(tasks)).reduce((a, b) => a + b, 0);
    const stop = Date.now();
    console.log("%d notes", res.size);
    console.log(
      "%d updates, %d deletions in %d seconds",
      updates,
      deletions,
      Math.round((stop - start) / 1000),
    );
    return res;
  }
}
