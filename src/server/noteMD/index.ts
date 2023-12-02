import { injectable } from "inversify";
import "reflect-metadata";
import { FileData, INote, INoteGetHTMLOpts } from "../interface";
import { getMeta } from "./getMeta";
import { getHTML } from "./getHTML";

@injectable()
export class NoteMD implements INote {
  getMeta(fileData: FileData, raw: string) {
    return getMeta(fileData, raw);
  }
  getHTML(opts: INoteGetHTMLOpts, raw: string) {
    return getHTML(opts, raw);
  }
}
