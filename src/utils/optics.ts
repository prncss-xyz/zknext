import { oState } from "@/components/store";
import { RangeField } from "@/core/filters";
import { DateField, DateRangeField, NumberField } from "@/core/note";
import { OrderField } from "@/core/sorters";

export const neg = (b: boolean) => !b;

function setElement(x: string) {
  return function (xs: string[], value: boolean) {
    const xs_ = xs.filter((x_) => !Object.is(x_, x));
    if (value) {
      xs_.push(x);
    }
    xs_.sort();
    return xs_;
  };
}
function isElement(x: string) {
  return function (xs: string[]) {
    return xs.includes(x);
  };
}

export const oDir = oState.prop("query").prop("filter").prop("dir");
export const oFocused = oState.prop("focusedNote");
export const oFocusedNote = oState.to((s) =>
  s.results.notes.find(({ id }) => id === s.focusedNote),
);
export const oFocusedIndex = oState.to((s) =>
  s.sorted.findIndex(({ id }) => id === s.focusedNote),
);
export const oQuery = oState.prop("query");
export const oTags = oQuery.prop("filter").prop("tags");
export function getOTag(tag: string) {
  return oTags.lens(isElement(tag), setElement(tag));
}
export const oSort = oQuery.prop("sort");
export const oField = oSort.prop("field");
export const oAsc = oSort.prop("asc");
export const oFilter = oQuery.prop("filter");
export const oView = oFilter.prop("view");
export const oViewType = oView.prop("type");
export const oHidden = oFilter.prop("hidden");
export const oSorted = oState.prop("sorted");
export const oResults = oState.prop("results");
export const oRestrict = oResults.prop("restrict");
export const oHiddenCount = oRestrict.prop("hidden");
export const oIds = oRestrict.prop("ids");
export const oRestrictTags = oRestrict.prop("tags");
export const oFiltered = oResults.prop("notes");
export const oFilteredCount = oResults
  .prop("notes")
  .to((notes) => notes.length);
export const getOFilter = (field: RangeField) => oFilter.prop(field);

export const oRestrictKanbans = oRestrict.prop("kanbans");
export const getORestictField = (field: "event" | "since" | "until" | "due") =>
  oResults.prop("restrict").prop(field);

export const getOFilterNumberBound = (field: NumberField, start: boolean) =>
  oFilter.lens(
    (s) => s[field]?.[start ? "start" : "end"],
    (s, v) => {
      let o = s[field] ?? {};
      let b = s[field]?.[start ? "end" : "start"];
      if (b !== undefined && v !== undefined) {
        if (start) {
          if (v > b) b = undefined;
        } else {
          if (v < b) b = undefined;
        }
      }
      if (start) {
        o = { end: b, start: v };
      } else {
        o = { start: b, end: v };
      }
      return { ...s, [field]: o };
    },
  );

export const getOFilterDateBound = (
  field: DateField | DateRangeField,
  start: boolean,
) =>
  oFilter.lens(
    (s) => s[field]?.[start ? "start" : "end"],
    (s, v) => {
      let o = s[field] ?? {};
      let b = s[field]?.[start ? "end" : "start"];
      if (b !== undefined && v !== undefined) {
        if (start) {
          if (v > b) b = undefined;
        } else {
          if (v < b) b = undefined;
        }
      }
      if (start) {
        o = { end: b, start: v };
      } else {
        o = { start: b, end: v };
      }
      return { ...s, [field]: o };
    },
  );

export const getOFilterBound_ = (field: RangeField, start: boolean) =>
  oFilter.prop(field as any).prop(start ? "start" : "end");
export const getOFilterActive = (field: RangeField) =>
  getOFilter(field).lens(Boolean, (_, v) => {
    return v ? {} : undefined;
  });
