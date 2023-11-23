import { injectable, inject } from "inversify";
import "reflect-metadata";
import { INotes } from "./interface";
import { ConfigType } from "../config/interface";
import type { IConfig } from "../config/interface";
import { getFiles } from "../utils/files";
import path from "path/posix";

@injectable()
export class NotesLive implements INotes {
  @inject(ConfigType) private config!: IConfig;
  public async getNotes() {
    const { notebookDir } = await this.config.value;
    const entries: { id: string }[] = [];
    for await (const id of getFiles(notebookDir)) {
      const ext = path.extname(id);
      if (ext !== ".md") continue;
      entries.push({ id });
    }
    return entries;
  }
}
