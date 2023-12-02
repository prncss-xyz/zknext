import { Errable } from "../utils/errable";

export interface Link {
  target: string;
  context: string;
}

export interface FileData {
  id: string;
  mtime: Date;
}

export interface NoteData {
  id: string;
  mtime: Date;
  title: string | null;
  wordcount: number;
  links: Link[];
}

export interface INotes {
  getNotes: () => Promise<NoteData[]>;
  getNote: (id: string) => Promise<Errable<NoteData>>;
  getHTML: (id: string, document: boolean) => Promise<Errable<string>>;
}

export const NotesType = Symbol.for("Notes");
