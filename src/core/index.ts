import { dirname, upDirs } from "../utils/path";

// TODO: inverted tags, kanban

export interface Link {
  target: string;
  context: string;
}

export interface NoteData {
  id: string;
  mtime: Date;
  title: string | null;
  wordcount: number;
  tags: string[];
  links: Link[];
}

export const nullNote: NoteData = {
  id: "",
  mtime: new Date(0),
  title: null,
  wordcount: 0,
  tags: [],
  links: [],
};

type NumberField = "wordcount";
type DateField = "mtime";
type LexicalField = "id";
type ScalarField = NumberField | DateField | LexicalField;

interface Sort {
  field: ScalarField;
  asc: boolean;
}

export const nullSort: Sort = {
  field: "id",
  asc: true,
};

interface Query {
  dir: string;
  mtime?: {
    lte?: Date;
    gte?: Date;
  };
  wordcount?: {
    lte?: number;
    gte?: number;
  };
  tags: string[];
  sort: Sort;
}

export const nullQuery: Query = {
  dir: "",
  tags: [],
  sort: nullSort,
};

function testScalar<T>(value: T, query?: { lte?: T; gte?: T }) {
  if (query?.gte && value < query?.gte) return false;
  if (query?.lte && value > query?.lte) return false;
  return true;
}

function getDateSorter(field: DateField) {
  return function (a: NoteData, b: NoteData) {
    const p = a[field].getTime();
    const q = b[field].getTime();
    return p - q;
  };
}

function getNumberSorter(field: NumberField) {
  return function (a: NoteData, b: NoteData) {
    const p = a[field];
    const q = b[field];
    return p - q;
  };
}

function getLexicalSorter(field: LexicalField) {
  return function (a: NoteData, b: NoteData) {
    const p = a[field];
    const q = b[field];
    // as we are only using this for id field, which is unique, this code path cannot happen
    // still having it in case we add other lexical sorting
    if (p === q) return 0;
    if (p < q) return -1;
    return 1;
  };
}

const idSorter = getLexicalSorter("id");

function switchSorter(field: ScalarField) {
  switch (field) {
    case "id":
      return getLexicalSorter(field);
    case "wordcount":
      return getNumberSorter(field);
    case "mtime":
      return getDateSorter(field);
  }
}

function getSorter({ field, asc }: Sort) {
  const baseSorter = switchSorter(field);
  const sgn = asc ? 1 : -1;
  return function (a: NoteData, b: NoteData) {
    let cmp = baseSorter(a, b);
    if (cmp === 0 && field !== "id") cmp = idSorter(a, b);
    return sgn * cmp;
  };
}

export function applyQuery(notes: Map<string, NoteData>, query: Query) {
  const res = new Set<NoteData>();
  const dirRes = new Set<string>();
  const tagRes = new Set<string>();
  for (const note of notes.values()) {
    if (!dirname(note.id).startsWith(query.dir)) continue;
    if (
      query.tags.length > 0 &&
      !note.tags.some((tag) => query.tags.includes(tag))
    )
      continue;
    if (!testScalar(note.wordcount, query.wordcount)) continue;
    if (!testScalar(note.mtime, query.mtime)) continue;
    // the not fullfills the query
    res.add(note);
    // data for possible query expensions
    for (const dir of upDirs(note.id)) dirRes.add(dir);
    for (const tag of note.tags) tagRes.add(tag);
  }

  // sort notes
  const notesOut = Array.from(res).sort(getSorter(query.sort));

  // serialize results
  const restrict = {
    dirs: Array.from(dirRes),
    tags: Array.from(tagRes),
  };
  return {
    notes: notesOut,
    restrict,
  };
}
