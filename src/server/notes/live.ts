import { injectable, inject } from "inversify";
import "reflect-metadata";
import { INotes, NoteData } from "./interface";
import { ConfigType } from "../config/interface";
import type { IConfig } from "../config/interface";
import { getFiles } from "../utils/files";
import path from "path/posix";
import { readFile, stat } from "node:fs/promises";
import { Failure, Errable } from "../utils/errable";
import { mdToHTML } from "./md/toHTML";
import { mdToMeta } from "./md/toMeta";

@injectable()
export class NotesLive implements INotes {
  @inject(ConfigType) private config!: IConfig;
  public async getNote(id: string) {
    return (await this.getIdToMeta()).get(id) ?? new Failure("nofile");
  }
  public async getHTML(id: string, document: boolean) {
    const idToMeta = await this.getIdToMeta();
    const metaRequest = idToMeta.get(id);
    if (!metaRequest) return new Failure("nofile");
    if (metaRequest._tag === "failure") return metaRequest;
    const { notebookDir } = await this.config.getConfig();
    const fullPath = path.join(notebookDir, id);
    const contents = await readFile(fullPath, "utf8");
    return await mdToHTML(contents, {
      id,
      idToMeta,
      document,
      untitled: "untitled",
    });
  }
  public async getNotes() {
    const entries: NoteData[] = [];
    for (const [_, note] of await this.getIdToMeta()) {
      if (note._tag === "failure") continue;
      entries.push(note.result);
    }
    return entries;
  }
  private async getIdToMeta() {
    this.idToMeta ??= await this.scanDir();
    return this.idToMeta;
  }
  private idToMeta: Map<string, Errable<NoteData>> | undefined;
  private async scanDir() {
    const resolvedNotes = new Map<string, Errable<NoteData>>();
    const { notebookDir } = await this.config.getConfig();
    for await (const id of getFiles(notebookDir)) {
      const ext = path.extname(id);
      if (ext !== ".md") continue;
      const note = await this.readNoteMeta(id);
      resolvedNotes.set(id, note);
    }
    return resolvedNotes;
  }
  private async readNoteMeta(id: string) {
    const { notebookDir } = await this.config.getConfig();
    const fullPath = path.join(notebookDir, id);
    // this is solely called during initial scan,
    // therefore we assume the file exists
    const { mtime } = await stat(fullPath);
    const contents = await readFile(fullPath, "utf8");
    return await mdToMeta({ id, mtime }, contents);
  }
}
