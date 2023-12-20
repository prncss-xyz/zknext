import { contains, upDirs } from "@/utils/path";
import { IDateRange, INote } from "./note";

function filterDateRange(
  query: { lte?: Date; gte?: Date } | undefined,
  value: IDateRange | null
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

interface DateRangeFilter {
  lte?: Date;
  gte?: Date;
}

interface BaseFilter {
  dir: string;
  mtime?: DateRangeFilter;
  due?: DateRangeFilter;
  since?: DateRangeFilter;
  until?: DateRangeFilter;
  event?: DateRangeFilter;
  wordcount?: {
    lte?: number;
    gte?: number;
  };
  kanban: string;
  tags: string[];
}

export const nullBaseFilter: BaseFilter = {
  dir: "",
  tags: [],
  kanban: "",
};

interface Filter extends BaseFilter {
  hidden: boolean;
}

export const nullFilter: Filter = {
  ...nullBaseFilter,
  hidden: false,
};

interface ApplyFilterOpts {
  hidden?: BaseFilter;
  kanbans: {
    [name: string]: string[];
  };
}

export const nullApplyFilterOpts: ApplyFilterOpts = {
  kanbans: {},
};

function filterNote(
  note: INote,
  filter: BaseFilter,
  opts: ApplyFilterOpts
) {
  if (!contains(filter.dir, note.id)) return false;
  if (
    filter.tags.length > 0 &&
    !note.tags.some((tag) => filter.tags.some((_tag) => contains(_tag, tag)))
  )
    return false;
  if (
    filter.kanban &&
    !opts.kanbans[filter.kanban]?.some((tag) =>
      note.tags.some((_tag) => contains(tag, _tag))
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
  filter: Filter
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
