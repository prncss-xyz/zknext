export interface ListNote {
  id: string;
}

interface ViewNoteExtra {}

export type ViewNote = ListNote & ViewNoteExtra;

export interface INotes {
  getNotes: () => Promise<ListNote[]>;
}

export const NotesType = Symbol.for("Notes");
