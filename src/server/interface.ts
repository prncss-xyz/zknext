import type { INote as NoteData } from "@/core/note";
import type { Errable } from "@/utils/errable";

export interface ICache {}
export const CacheType = Symbol.for("Cache");

export interface IRepo {
  getNotes: () => Promise<NoteData[]>;
  getNote: (id: string) => Promise<Errable<NoteData>>;
  getHTML: (id: string, document: boolean) => Promise<Errable<string>>;
}
export const RepoType = Symbol.for("Repo");

export interface ConfigData {
  notebookDir: string;
}
export interface IConfig {
  getConfig: () => Promise<ConfigData>;
}
export const ConfigType = Symbol.for("Config");

export interface FileData {
  id: string;
  mtime: Date;
}
export interface INoteGetHTMLOpts {
  /** id of note being converted */
  id: string;
  /** parsing metadata */
  idToMeta: Map<string, Errable<NoteData>>;
  /** wether to create a documnet (true) or a fragment (false) */
  document: boolean;
  /** string to use when there is no title */
  untitled: string;
}
export interface INote {
  shouldKeepFile: (id: string) => boolean;
  getMeta(fileData: FileData, raw: string): Promise<Errable<NoteData>>;
  getHTML(opts: INoteGetHTMLOpts, raw: string): Promise<Errable<string>>;
}
export const NoteType = Symbol.for("Note");
