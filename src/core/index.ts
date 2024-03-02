import { dateString, numString } from "@/utils/encodec";
import { IFilter, RangeField, nullFilter } from "./filters";
import { isDateField, isDateRangeField, isNumberField } from "./note";
import { ISort, OrderField, nullSort } from "./sorters";

export interface IQuery {
  sort: ISort;
  filter: IFilter;
}

export const nullQuery: IQuery = {
  sort: nullSort,
  filter: nullFilter,
};

export function isValidBound(field: OrderField, value: string) {
  if (!value) return true;
  if (isNumberField(field)) {
    return Boolean(numString.decode(value));
  }
  if (isDateField(field) || isDateRangeField(field)) {
    return Boolean(dateString.decode(value));
  }
  // string is always valid
  throw new Error(`unexpected field ${field}`);
}

export function setBound(
  query: IQuery,
  field: OrderField,
  start: boolean,
  value: string,
): IQuery {
  if (isNumberField(field)) {
    const num = Number(value);
    if (isNaN(num)) return query;
    let range = query.filter[field] || {};
    if (start) {
      const start = num;
      let end = range.end;
      if (end && end <= start) end = undefined;
      range = { start, end };
    } else {
      const end = num;
      let start = range.start;
      if (start && start >= end) start = undefined;
      range = { start, end };
    }
    return { ...query, filter: { ...query.filter, [field]: range } };
  }
  if (isDateField(field) || isDateRangeField(field)) {
    const date = dateString.decode(value);
    if (date === undefined) return query;
    let range = query.filter[field] || {};
    if (start) {
      const start = date;
      let end = range.end;
      if (end && end <= start) end = undefined;
      range = { start, end };
    } else {
      const end = date;
      let start = range.start;
      if (start && start >= end) start = undefined;
      range = { start, end };
    }
    return { ...query, filter: { ...query.filter, [field]: range } };
  }
  return query;
}

export function getBound(query: IQuery, field: RangeField, start: boolean) {
  const bound = start ? "start" : "end";
  const value = (query.filter[field] as any)?.[bound];
  if (!value) return "";
  if (isNaN(value)) return "";
  if (value instanceof Date) {
    return dateString.encode(value);
  }
  return String(value);
}
