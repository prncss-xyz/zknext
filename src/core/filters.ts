import { contains, upDirs } from "@/utils/path";
import { IDateRange, INote } from "./note";

function filterDateRange(
  query: { lte?: Date; gte?: Date } | undefined,
  value: IDateRange | null,
) {
  if (query === undefined) return true;
  if (value === null) return false;
  if (query.gte && value.end && query.gte > value.end) return false;
  if (query.lte && value.start && query.lte < value.start) return false;
  return true;
}

function filterOrder<T>(query: { lte?: T; gte?: T } | undefined, value: T) {
  if (query === undefined) return true;
  if (value === undefined || value === null) return false;
  if (query.gte && !(value >= query.gte)) return false;
  if (query.lte && !(value <= query.lte)) return false;
  return true;
}

interface IDateRangeFilter {
  lte?: Date;
  gte?: Date;
}

interface IBaseFilter {
  // actually the dir an id will be checked against
  id: string;
  title: string;
  asset: string;
  mtime?: IDateRangeFilter;
  due?: IDateRangeFilter;
  since?: IDateRangeFilter;
  until?: IDateRangeFilter;
  event?: IDateRangeFilter;
  wordcount?: {
    lte?: number;
    gte?: number;
  };
  kanban: string;
  tags: string[];
}

export const existsFilter: IBaseFilter = {
  id: "",
  title: "",
  asset: "",
  mtime: {},
  due: {},
  since: {},
  until: {},
  event: {},
  wordcount: {},
  kanban: "",
  tags: [],
};

export const nullBaseFilter: IBaseFilter = {
  id: "",
  title: "",
  asset: "",
  tags: [],
  kanban: "",
};

export interface IFilter extends IBaseFilter {
  hidden: boolean;
}

export const nullFilter: IFilter = {
  ...nullBaseFilter,
  hidden: false,
};

interface ApplyFilterOpts {
  hidden?: IBaseFilter;
  kanbans: {
    [name: string]: string[];
  };
}

export const nullApplyFilterOpts: ApplyFilterOpts = {
  kanbans: {},
};

function filterNote(note: INote, filter: IBaseFilter, opts: ApplyFilterOpts) {
  if (!contains(filter.id, note.id)) return false;
  if (
    filter.tags.length > 0 &&
    !note.tags.some((tag) => filter.tags.some((_tag) => contains(_tag, tag)))
  )
    return false;
  if (
    filter.kanban &&
    !opts.kanbans[filter.kanban]?.some((tag) =>
      note.tags.some((_tag) => contains(tag, _tag)),
    )
  )
    return false;
  if (!filterOrder(filter.wordcount, note.wordcount)) return false;
  if (!filterOrder(filter.mtime, note.mtime)) return false;
  if (!filterOrder(filter.due, note.due)) return false;
  if (!filterOrder(filter.since, note.since)) return false;
  if (!filterOrder(filter.until, note.until)) return false;
  if (!filterDateRange(filter.event, note.event)) return false;
  return true;
}

export function applyFilter(
  opts: ApplyFilterOpts,
  notes: Map<string, INote>,
  filter: IFilter,
) {
  const res = new Set<INote>();
  const dirRes = new Set<string>();
  const tagRes = new Set<string>();
  let hidden = 0;
  for (const note of notes.values()) {
    if (!filterNote(note, filter, opts)) continue;
    if (!filter.hidden && opts.hidden && filterNote(note, opts.hidden, opts)) {
      ++hidden;
      continue;
    }
    // the note is fullfilling the filter
    res.add(note);
    // data for possible filter expensions
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
