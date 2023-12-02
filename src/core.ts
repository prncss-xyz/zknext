export interface Link {
  target: string;
  context: string;
}

export interface NoteData {
  id: string;
  mtime: Date;
  title: string | null;
  wordcount: number;
  links: Link[];
}
