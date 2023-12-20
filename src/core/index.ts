import { contains, upDirs } from "../utils/path";

export interface Link {
  target: string;
  context: string;
}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface NoteData {
  id: string;
  mtime: Date;
  title: string | null;
  event: DateRange | null;
  due: Date | null;
  since: Date | null;
  until: Date | null;
  asset: string;
  wordcount: number;
  tags: string[];
  links: Link[];
}

export const nullNote: NoteData = {
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

type NumberField = "wordcount";
type DateField = "mtime" | "due" | "since" | "until";
type DateRangeField = "event";
type LexicalField = "id";
type OrderField = NumberField | DateField | DateRangeField | LexicalField;

interface Sort {
  field: OrderField;
  asc: boolean;
}

export const nullSort: Sort = {
  field: "id",
  asc: true,
};

interface DateRangeQuery {
  lte?: Date;
  gte?: Date;
}

interface BaseQuery {
  dir: string;
  mtime?: DateRangeQuery;
  due?: DateRangeQuery;
  since?: DateRangeQuery;
  until?: DateRangeQuery;
  event?: DateRangeQuery;
  wordcount?: {
    lte?: number;
    gte?: number;
  };
  kanban: string;
  tags: string[];
}

export const nullBaseQuery: BaseQuery = {
  dir: "",
  tags: [],
  kanban: "",
};

interface Query extends BaseQuery {
  hidden: boolean;
}

export const nullQuery: Query = {
  ...nullBaseQuery,
  hidden: false,
};

interface ApplyQueryOpts {
  hidden?: BaseQuery;
  kanbans: {
    [name: string]: string[];
  };
}

export const nullApplyQueryOpts: ApplyQueryOpts = {
  kanbans: {},
};

function testDateRange(
  query: { lte?: Date; gte?: Date } | undefined,
  value: DateRange | null,
) {
  if (query === undefined) return true;
  if (value === null) return false;
  if (query.gte && value.end && (query.gte > value.end)) return false;
  if (query.lte && value.start && (query.lte < value.start)) return false;
  return true;
}

function testOrder<T>(query: { lte?: T; gte?: T } | undefined, value: T) {
  if (query === undefined) return true;
  if (value === undefined || value === null) return false;
  if (query.gte && !(value >= query.gte)) return false;
  if (query.lte && !(value <= query.lte)) return false;
  return true;
}

function getDateRangeSorter(field: DateRangeField) {
  return function (a: NoteData, b: NoteData) {
    const n = a[field]
    const o = b[field]
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

function getDateSorter(field: DateField) {
  return function (a: NoteData, b: NoteData) {
    const p = a[field]?.getTime();
    const q = b[field]?.getTime();
    if (p === q) return 0;
    if (p === undefined) return -1;
    if (q === undefined) return 1;
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
    // as we are only using this for id field, which has unique values, this code path cannot happen
    // still having it in case we add other lexical sorting
    if (p === q) return 0;
    if (p < q) return -1;
    return 1;
  };
}

const idSorter = getLexicalSorter("id");

function switchSorter(field: OrderField) {
  switch (field) {
    case "id":
      return getLexicalSorter(field);
    case "wordcount":
      return getNumberSorter(field);
    case "mtime":
      return getDateSorter(field);
    case "due":
      return getDateSorter(field);
    case "until":
      return getDateSorter(field);
    case "since":
      return getDateSorter(field);
    case "event":
      return getDateRangeSorter(field);
  }
}

export function getSorter({ field, asc }: Sort) {
  const baseSorter = switchSorter(field);
  const sgn = asc ? 1 : -1;
  return function (a: NoteData, b: NoteData) {
    let cmp = baseSorter(a, b);
    if (cmp === 0 && field !== "id") cmp = idSorter(a, b);
    return sgn * cmp;
  };
}

function testNote(note: NoteData, query: BaseQuery, opts: ApplyQueryOpts) {
  if (!contains(query.dir, note.id)) return false;
  if (
    query.tags.length > 0 &&
    !note.tags.some((tag) => query.tags.some((_tag) => contains(_tag, tag)))
  )
    return false;
  if (
    query.kanban &&
    !opts.kanbans[query.kanban]?.some((tag) =>
      note.tags.some((_tag) => contains(tag, _tag)),
    )
  )
    return false;
  if (!testOrder(query.wordcount, note.wordcount)) return false;
  if (!testOrder(query.mtime, note.mtime)) return false;
  if (!testOrder(query.due, note.due)) return false;
  if (!testOrder(query.since, note.since)) return false;
  if (!testOrder(query.until, note.until)) return false;
  if (!testDateRange(query.event, note.event)) return false;
  return true;
}

export function applyQuery(
  opts: ApplyQueryOpts,
  notes: Map<string, NoteData>,
  query: Query,
) {
  const res = new Set<NoteData>();
  const dirRes = new Set<string>();
  const tagRes = new Set<string>();
  let hidden = 0;
  for (const note of notes.values()) {
    if (!testNote(note, query, opts)) continue;
    if (!query.hidden && opts.hidden && testNote(note, opts.hidden, opts)) {
      ++hidden;
      continue;
    }
    // the note is fullfilling the query
    res.add(note);
    // data for possible query expensions
    for (const tag of note.tags)
      for (const upTag of upDirs(true, tag)) tagRes.add(upTag);
    for (const dir of upDirs(false, note.id)) dirRes.add(dir);
  }

  // sort notes
  const notesOut = Array.from(res);

  const kanbanRes = new Set<string>();
  for (const [name, tags] of Object.entries(opts.kanbans)) {
    if (tags.some((tag) => tagRes.has(tag))) kanbanRes.add(name);
  }

  // serialize results
  const restrict = {
    dirs: Array.from(dirRes).sort(),
    tags: Array.from(tagRes).sort(),
    kanbans: Array.from(kanbanRes).sort(),
  };
  return {
    notes: notesOut,
    restrict,
    hidden,
  };
}
