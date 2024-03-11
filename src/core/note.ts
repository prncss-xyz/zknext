export interface ILink {
  target: string;
  context: string;
}

export interface IDateRange {
  start: Date | null;
  end: Date | null;
}

export interface INote {
  id: string;
  mtime: Date;
  title: string | null;
  event: IDateRange | null;
  due: Date | null;
  since: Date | null;
  until: Date | null;
  asset: string;
  wordcount: number;
  tags: string[];
  links: ILink[];
}

export const nullNote: INote = {
  id: "",
  mtime: new Date(0),
  title: null,
  event: null,
  due: null,
  since: null,
  until: null,
  asset: "",
  wordcount: 0,
  tags: [],
  links: [],
};

export type Field = keyof INote;

export const optFields: Field[] = ["title", "event", "due", "since", "until"];

export type NumberField = {
  [K in keyof INote]: INote[K] extends number | null ? K : never;
}[keyof INote];
export const numberFields: NumberField[] = ["wordcount"];
export function isNumberField(field: Field): field is NumberField {
  return (numberFields as Field[]).includes(field);
}

export type DateField = {
  [K in keyof INote]: INote[K] extends Date | null ? K : never;
}[keyof INote];
export const dateFields: DateField[] = ["mtime", "due", "since", "until"];
export function isDateField(field: Field): field is DateField {
  return (dateFields as Field[]).includes(field);
}

export type DateRangeField = {
  [K in keyof INote]: INote[K] extends IDateRange | null ? K : never;
}[keyof INote];
export const dateRangeFields: DateRangeField[] = ["event"];
export function isDateRangeField(field: Field): field is DateRangeField {
  return (dateRangeFields as Field[]).includes(field);
}

export type StringField = "id" | "title";
export const stringFields: StringField[] = ["id", "title"];
export function isStringField(field: Field): field is StringField {
  return (stringFields as Field[]).includes(field);
}
