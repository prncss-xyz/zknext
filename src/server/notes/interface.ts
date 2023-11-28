import { Errable } from "../interfaces";

export interface Link {
  target: string;
  context: string;
}

export interface NoteData {
  id: string;
  mtime: Date;
  contents: string;
  title: string | null;
  wordcount: number;
  links: Link[];
}

export interface INotes {
  getNotes: () => Promise<NoteData[]>;
  getNote: (id: string) => Promise<Errable<NoteData>>;
  getLinks: (id: string) => Promise<Errable<NoteData>[]>;
}

export const NotesType = Symbol.for("Notes");
