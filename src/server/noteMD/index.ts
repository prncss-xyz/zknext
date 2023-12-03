import { injectable } from "inversify";
import "reflect-metadata";
import { FileData, INote, INoteGetHTMLOpts } from "../interface";
import { getMeta } from "./getMeta";
import { getHTML } from "./getHTML";
import path from "path/posix";

@injectable()
export class NoteMD implements INote {
  shouldKeepFile(id: string) {
    const ext = path.extname(id);
    return ext === ".md";
  }
  getMeta(fileData: FileData, raw: string) {
    return getMeta(fileData, raw);
  }
  getHTML(opts: INoteGetHTMLOpts, raw: string) {
    return getHTML(opts, raw);
  }
}
