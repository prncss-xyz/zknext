import { oState } from "@/components/store";
import { RangeField } from "@/core/filters";
import { DateField, DateRangeField, NumberField } from "@/core/note";
import { OrderField } from "@/core/sorters";
import { compose } from "optics-ts";

export const neg = (b: boolean) => !b;

function update(x: string) {
  return function (xs: string[], value: boolean) {
    const xs_ = xs.filter((x_) => !Object.is(x_, x));
    if (value) {
      xs_.push(x);
    }
    xs_.sort();
    return xs_;
  };
}

function view(x: string) {
  return function (xs: string[]) {
    return xs.includes(x);
  };
}

export const oTags = oState.prop("query").prop("filter").prop("tags");
export function getOTag(tag: string) {
  return oTags.lens(view(tag), update(tag));
}

export const oSort = oState.prop("query").prop("sort");
export const oField = oSort.prop("field");
export const oAsc = oSort.prop("asc");
export const oDir = oState.prop("query").prop("filter").prop("dir");
export const oQuery = oState.prop("query");
export const oFilter = oQuery.prop("filter");
export const oView = oFilter.prop("view");
export const oViewType = oQuery.prop("filter").prop("view").prop("type");
export const oHidden = oQuery.prop("filter").prop("hidden");
export const oSorted = oState.prop("sorted");
export const oResults = oState.prop("results");
export const oHiddenCount = oResults.prop("restrict").prop("hidden");
export const oIds = oResults.prop("restrict").prop("ids");
export const oFiltered = oResults.prop("notes");
export const oFilteredCount = oResults
  .prop("notes")
  .to((notes) => notes.length);
export const getOFilter = (field: RangeField) => oFilter.prop(field);

export const oRestrictKanbans = oResults.prop("restrict").prop("kanbans");
export const getORestictField = (field: "event" | "since" | "until" | "due") =>
  oResults.prop("restrict").prop(field);

export const getOSelectorField = (field: OrderField, asc: boolean) => {
  return oSort.lens(
    (s) => s.field === field && s.asc === asc,
    // setting to false has unspecified behavior
    () => ({ field, asc }),
  );
};

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
