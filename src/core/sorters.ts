import {
  RangeField,
  INote,
  NumberField,
  StringField,
  isNumberField,
  isStringField,
  isRangeField,
} from "./note";

export type OrderField = NumberField | RangeField | StringField;
export const orderFields: OrderField[] = [
  "id",
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

export function getRangeSorter(field: RangeField) {
  return function (a: INote, b: INote) {
    const af = a[field];
    const bf = b[field];
    // missing field goes last
    if (!af) {
      if (!bf) return 0;
      return 1;
    }
    if (!bf) return -1;
    const as_ = af.start;
    const as = typeof as_ === "number" ? as_ : -Infinity;
    const bs_ = bf.start;
    const bs = typeof bs_ === "number" ? bs_ : -Infinity;
    if (as !== bs) {
      return as - bs;
    }
    const ae_ = af.end;
    const ae = typeof ae_ === "number" ? ae_ : +Infinity;
    const be_ = bf.end;
    const be = typeof be_ === "number" ? be_ : +Infinity;
    return ae - be;
  };
}

export function getNumberSorter(field: NumberField) {
  return function (a: INote, b: INote) {
    const p = a[field];
    const q = b[field];
    if (typeof p !== "number") {
      if (typeof q !== "number") return 0;
      return 1;
    }
    if (typeof q !== "number") return -1;
    return p - q;
  };
}

export function getStringSorter(field: StringField) {
  return function (a: INote, b: INote) {
    const af = a[field];
    const bf = b[field];
    // missing field goes last
    if (!af) {
      if (!bf) return 0;
      return 1;
    }
    if (!bf) return -1;
    if (af < bf) return -1;
    if (af === bf) return 0;
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
  if (isRangeField(field)) {
    return getRangeSorter(field);
  }
  return getRangeSorter(field);
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
