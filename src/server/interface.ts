import type { INote } from "@/core/note";
import type { Errable } from "@/utils/errable";

export interface ICache {}
export const CacheType = Symbol.for("Cache");

export interface INoteDB {
  id: string;
  mtime: number;
  payload: string;
}

export interface IDB {
  init: () => Promise<void>;
  updateNote: (note: INote) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNotes: () => Promise<INoteDB[]>;
  decode: (noteDB: INoteDB) => INote;
}

export const DBType = Symbol.for("DB");

export interface IRepo {
  dump: () => Promise<unknown>;
  getNotes: () => Promise<INote[]>;
  getNote: (id: string) => Promise<INote | undefined>;
  getHTML: (id: string, document: boolean) => Promise<string>;
}
export const RepoType = Symbol.for("Repo");

export interface ConfigData {
  notebookDir: string;
  cache: string;
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
  idToMeta: Map<string, INote>;
  /** wether to create a documnet (true) or a fragment (false) */
  document: boolean;
  /** string to use when there is no title */
  untitled: string;
}
export interface INoteFile {
  shouldReadFile: (id: string) => boolean;
  getMeta(fileData: FileData, raw: string): Promise<Errable<INote>>;
  getHTML(opts: INoteGetHTMLOpts, raw: string): Promise<string>;
}
export const NoteType = Symbol.for("Note");
