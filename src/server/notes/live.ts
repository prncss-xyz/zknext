import { injectable, inject } from "inversify";
import "reflect-metadata";
import { INotes, NoteData } from "./interface";
import { ConfigType } from "../config/interface";
import type { IConfig } from "../config/interface";
import { getFiles } from "../utils/files";
import path from "path/posix";
import { readFile, stat } from "node:fs/promises";
import { Errable, Failure, Success } from "../interfaces";
import { analyseMD } from "./analyseMD";

@injectable()
export class NotesLive implements INotes {
  @inject(ConfigType) private config!: IConfig;
  private notes: Promise<Map<string, Errable<NoteData>>>;
  constructor() {
    this.notes = this._getNotes();
  }
  public async getNotes() {
    const entries: NoteData[] = [];
    for (const [_, note] of await this.notes) {
      if (note._tag === "failure") continue;
      entries.push(note.result);
    }
    return entries;
  }
  private async _getNotes() {
    const resolvedNotes = new Map<string, Errable<NoteData>>();
    const { notebookDir } = await this.config.value;
    for await (const id of getFiles(notebookDir)) {
      const ext = path.extname(id);
      if (ext !== ".md") continue;
      const note = await this._getNote(id);
      resolvedNotes.set(id, note);
    }
    return resolvedNotes;
  }
  public async getNote(id: string) {
    return (await this.notes).get(id) ?? new Failure("nofile");
  }
  public async getLinks(id: string) {
    const note = await this.getNote(id);
    if (note._tag === "failure") return [];
    const links = await Promise.all(
      note.result.links.map(({ target }) => this.getNote(target)),
    );
    return links;
  }
  private async _getNote(id: string) {
    const { notebookDir } = await this.config.value;
    const fullPath = path.join(notebookDir, id);
    const contents = await readFile(fullPath, "utf8");
    const analysed = await analyseMD(contents);
    if (analysed._tag === "failure") return analysed;
    const { result } = analysed;
    const { mtime } = await stat(fullPath);
    return new Success({
      id,
      mtime,
      contents,
      ...result,
    });
  }
}
