import { oState } from "@/components/store";

export const neg = (b: boolean) => !b;
export const oSort = oState.prop("query").prop("sort");
export const oField = oSort.prop("field");
export const oAsc = oSort.prop("asc");

export const oDir = oState.prop("query").prop("filter").prop("dir");

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

export const oQuery = oState.prop("query");
export const oView = oQuery.prop("filter").prop("view");
export const oViewType = oQuery.prop("filter").prop("view").prop("type");
export const oHidden = oQuery.prop("filter").prop("hidden");
