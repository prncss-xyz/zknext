import {
  DateRangeField,
  INote,
  DateField,
  NumberField,
  StringField,
  isDateField,
  isNumberField,
  isStringField,
} from "./note";

export type OrderField = NumberField | DateField | DateRangeField | StringField;
export const orderFields: OrderField[] = [
  "id",
  "mtime",
  "title",
  "event",
  "due",
  "since",
  "until",
  "asset",
  "wordcount",
];

export interface ISort {
  field: OrderField;
  asc: boolean;
}

export const nullSort: ISort = {
  field: "title",
  asc: true,
};

export function getDateRangeSorter(field: DateRangeField) {
  return function (a: INote, b: INote) {
    const n = a[field];
    const o = b[field];
    if (!n && !o) return 0;
    // missing field goes last
    if (!n) return 1;
    if (!o) return -1;
    const p = a[field]?.start?.getTime();
    const q = b[field]?.start?.getTime();
    if (p !== q) {
      // undefined start is akin to minus infinity
      if (p === undefined) return -1;
      if (q === undefined) return 1;
      return p - q;
    }
    const r = a[field]?.end?.getTime();
    const s = b[field]?.end?.getTime();
    if (r === s) return 0;
    // undefined end is akin to plus infinity
    if (r === undefined) return 1;
    if (s === undefined) return -1;
    return r - s;
  };
}

export function getDateSorter(field: DateField) {
  return function (a: INote, b: INote) {
    const p = a[field]?.getTime();
    const q = b[field]?.getTime();
    if (p === q) return 0;
    if (p === undefined) return -1;
    if (q === undefined) return 1;
    return p - q;
  };
}

export function getNumberSorter(field: NumberField) {
  return function (a: INote, b: INote) {
    const p = a[field];
    const q = b[field];
    return p - q;
  };
}

export function getStringSorter(field: StringField) {
  return function (a: INote, b: INote) {
    const p = a[field];
    const q = b[field];
    if (p === q) return 0;
    if (!p) return -1;
    if (!q) return 1;
    if (p < q) return -1;
    return 1;
  };
}

const idSorter = getStringSorter("id");

function switchSorter(field: OrderField) {
  if (isStringField(field)) {
    return getStringSorter(field);
  }
  if (isNumberField(field)) {
    return getNumberSorter(field);
  }
  if (isDateField(field)) {
    return getDateSorter(field);
  }
  return getDateRangeSorter(field);
}

export function getSorter({ field, asc }: ISort) {
  const baseSorter = switchSorter(field);
  const sgn = asc ? 1 : -1;
  return function (a: INote, b: INote) {
    let cmp = baseSorter(a, b);
    if (cmp === 0 && field !== "id") cmp = idSorter(a, b);
    return sgn * cmp;
  };
}
