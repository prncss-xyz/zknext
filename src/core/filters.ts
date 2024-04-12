import { contains, upDirs } from "@/utils/path";
import { IRange, INote } from "./note";

function filterOrder(query: IRange | undefined, value: number | undefined) {
  if (!query) return true;
  if (!value) return false;
  if (query.start && !(value >= query.start)) return false;
  if (query.end && !(value <= query.end)) return false;
  return true;
}

function filterRange(query: IRange | undefined, value: IRange | undefined) {
  if (!query) return true;
  if (!value) return false;
  if (query.start && value.end && query.start > value.end) return false;
  if (query.end && value.start && query.end < value.start) return false;
  return true;
}

interface INotesView {
  type: "notes";
}

interface IKanbanView {
  type: "kanban";
  kanban: string;
}

export function isKanbanView(view: View): view is IKanbanView {
  return view.type === "kanban";
}

type View = INotesView | IKanbanView;

export type RangeField =
  | "wordcount"
  | "due"
  | "mtime"
  | "since"
  | "until"
  | "event";

interface IBaseFilter {
  // actually the dir an id will be checked against
  dir: string;
  view: View;
  tags: string[];
  wordcount?: IRange;
  due?: IRange;
  mtime?: IRange;
  since?: IRange;
  until?: IRange;
  event?: IRange;
}

export const nullBaseFilter: IBaseFilter = {
  dir: "",
  view: { type: "notes" },
  tags: [],
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

function filterNote(opts: ApplyFilterOpts, filter: IBaseFilter, note: INote) {
  if (!contains(filter.dir, note.id)) return false;
  if (
    filter.tags.length > 0 &&
    !note.tags.some((tag) => filter.tags.some((_tag) => contains(_tag, tag)))
  )
    return false;
  if (
    filter.view.type === "kanban" &&
    !opts.kanbans[filter.view.kanban]?.some((tag) =>
      note.tags.some((_tag) => contains(tag, _tag)),
    )
  )
    return false;
  if (!filterOrder(filter.wordcount, note.wordcount)) return false;
  if (!filterOrder(filter.mtime, note.mtime)) return false;
  if (!filterOrder(filter.due, note.due)) return false;
  if (!filterOrder(filter.since, note.since)) return false;
  if (!filterOrder(filter.until, note.until)) return false;
  if (!filterRange(filter.event, note.event)) return false;
  return true;
}

export function applyFilter(
  opts: ApplyFilterOpts,
  filter: IFilter,
  notes: INote[],
) {
  const res = new Set<INote>();
  const dirRes = new Set<string>();
  const tagRes = new Set<string>();
  let event = false;
  let since = false;
  let due = false;
  let until = false;
  let hidden = 0;
  for (const note of notes.values()) {
    if (!filterNote(opts, filter, note)) continue;
    if (opts.hidden && filterNote(opts, opts.hidden, note)) {
      ++hidden;
      if (!filter.hidden) {
        continue;
      }
    }
    event ||= Boolean(note.event);
    since ||= Boolean(note.since);
    due ||= Boolean(note.due);
    until ||= Boolean(note.until);
    // the note is fullfilling the filter
    res.add(note);
    // data for possible filter expensions
    for (const tag of note.tags)
      for (const upTag of upDirs(true, tag)) tagRes.add(upTag);
    // empty tag do not makes sense
    tagRes.delete("");
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
    ids: Array.from(dirRes).sort(),
    tags: Array.from(tagRes).sort(),
    kanbans: Array.from(kanbanRes).sort(),
    event,
    since,
    until,
    due,
    hidden,
  };
  return {
    notes: notesOut,
    restrict,
  };
}

export const nullFilterResults: ReturnType<typeof applyFilter> = {
  notes: [],
  restrict: {
    ids: [],
    tags: [],
    kanbans: [],
    event: false,
    since: false,
    due: false,
    until: false,
    hidden: 0,
  },
};
