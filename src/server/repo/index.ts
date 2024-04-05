import { injectable, inject } from "inversify";
import "reflect-metadata";
import { ConfigType, DBType, IRepo, NoteType } from "../interface";
import type { IConfig, IDB, INoteFile } from "../interface";
import { getFiles } from "./files";
import path from "path/posix";
import { readFile, stat } from "node:fs/promises";
import { INote } from "@/core/note";
import { fromSuccess } from "@/utils/errable";

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
  private async getIdToMeta() {
    if (this.idToMeta) return this.idToMeta;
    const res = await this.scanDir();
    this.idToMeta = res;
    return res;
  }
  private idToMeta: Map<string, INote> | undefined;
  private async scanDir() {
    await this.db.init();
    const cachedNotes = new Map<string, INote>();
    const passedNotes = new Set<string>();
    for (const note of await this.db.getNotes()) {
      cachedNotes.set(note.id, note);
      passedNotes.add(note.id);
    }
    const { notebookDir } = await this.config.getConfig();
    // TODO: parallelize
    for await (const id of getFiles(notebookDir)) {
      if (!this.note.shouldReadFile(id)) continue;
      passedNotes.delete(id);
      const cached = cachedNotes.get(id);
      if (cached) {
        /* cached.mtime */
        // TODO: compare mtimes
      }
      const noteReq = await this.readNoteMeta(id);
      if (noteReq._tag === "success") {
        const note = fromSuccess(noteReq);
        cachedNotes.set(id, note);
        await this.db.updateNote(note);
      }
    }
    for (const id of passedNotes.keys()) {
      await this.db.deleteNote(id);
    }
    return cachedNotes;
  }
  private async readNoteMeta(id: string) {
    const { notebookDir } = await this.config.getConfig();
    const fullPath = path.join(notebookDir, id);
    // this is solely called during initial scan,
    // therefore we assume the file exists
    const { mtime } = await stat(fullPath);
    const contents = await readFile(fullPath, "utf8");
    return await this.note.getMeta({ id, mtime }, contents);
  }
}
