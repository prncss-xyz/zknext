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
  "mtime",
  "title",
  "event",
  "due",
  "since",
  "until",
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
    const af = a[field];
    const bf = b[field];
    if (!af && !bf) return 0;
    // missing field goes last
    if (!af) return 1;
    if (!bf) return -1;
    const as = a[field]?.start?.getTime();
    const bs = b[field]?.start?.getTime();
    if (as !== bs) {
      // undefined start is akin to minus infinity
      if (as === undefined) return -1;
      if (bs === undefined) return 1;
      return as - bs;
    }
    const ae = a[field]?.end?.getTime();
    const be = b[field]?.end?.getTime();
    if (ae === be) return 0;
    // undefined end is akin to plus infinity
    if (ae === undefined) return 1;
    if (be === undefined) return -1;
    return ae - be;
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
