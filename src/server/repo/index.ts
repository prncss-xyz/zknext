import { injectable, inject } from "inversify";
import "reflect-metadata";
import { ConfigType, IRepo, NoteType } from "../interface";
import type { IConfig, INote } from "../interface";
import { getFiles } from "./files";
import path from "path/posix";
import { readFile, stat } from "node:fs/promises";
import { NoteData } from "@/core";
import { Errable, Failure } from "@/utils/errable";

@injectable()
export class RepoLive implements IRepo {
  @inject(ConfigType) private config!: IConfig;
  @inject(NoteType) private note!: INote;
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
    return await this.note.getMeta({ id, mtime }, contents);
  }
}
