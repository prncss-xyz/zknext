export interface ILink {
  target: string;
  context: string;
}

export interface IRange {
  start?: number;
  end?: number;
}

export interface INote {
  id: string;
  mtime: number;
  title: string;
  event: IRange | undefined;
  due: number | undefined;
  since: number | undefined;
  until: number | undefined;
  asset: string;
  wordcount: number;
  tags: string[];
  links: ILink[];
}

export const nullNote: INote = {
  id: "",
  mtime: 0,
  title: "",
  event: undefined,
  due: undefined,
  since: undefined,
  until: undefined,
  asset: "",
  wordcount: 0,
  tags: [],
  links: [],
};

export type Field = keyof INote;

export const optFields: Field[] = ["title", "event", "due", "since", "until"];

export type NumberField = {
  [K in keyof INote]: INote[K] extends number | undefined ? K : never;
}[keyof INote];
export const numberFields: NumberField[] = [
  "wordcount",
  "mtime",
  "due",
  "since",
  "until",
];
export function isNumberField(field: Field): field is NumberField {
  return (numberFields as Field[]).includes(field);
}

export type RangeField = {
  [K in keyof INote]: INote[K] extends IRange | undefined ? K : never;
}[keyof INote];
export const rangeFields = ["event"];
export function isRangeField(field: Field): field is RangeField {
  return (rangeFields as Field[]).includes(field);
}

export type StringField = "id" | "title";
export const stringFields: StringField[] = ["id", "title"];
export function isStringField(field: Field): field is StringField {
  return (stringFields as Field[]).includes(field);
}
