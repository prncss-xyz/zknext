import { parseDate, formatDate } from "@/utils/dates";
import { IFilter, nullFilter } from "./filters";
import {
  isDateField,
  isDateRangeField,
  isNumberField,
} from "./note";
import { ISort, OrderField, nullSort } from "./sorters";

export interface IQuery {
  sort: ISort;
  filter: IFilter;
}

export const nullQuery: IQuery = {
  sort: nullSort,
  filter: nullFilter,
};

export function isActiveField(query: IQuery, field: OrderField) {
  const { filter } = query;
  return Boolean(filter[field]);
}

export function activateField(query: IQuery, field: OrderField) {
  if (!isActiveField(query, field)) {
    return { ...query, filter: { ...query.filter, [field]: {} } };
  }
  return query;
}

export function deActivateField(query: IQuery, field: OrderField) {
  return { ...query, filter: { ...query.filter, [field]: null } };
}

export function setSort(query: IQuery, sort: ISort): IQuery {
  const { field } = sort;
  return { ...activateField(query, field), sort };
}

export function setFilter(
  query: IQuery,
  field: OrderField,
  value: boolean,
): IQuery {
  let { sort } = query;
  if (value) {
    return { sort, filter: { ...query.filter, [field]: {} } };
  }
  if (sort.field === field) sort = nullSort;
  return { sort, filter: { ...query.filter, [field]: null } };
}

export function isValidBound(field: OrderField, value: string) {
  if (!value) return true;
  if (isNumberField(field)) {
    return !isNaN(Number(value));
  }
  if (isDateField(field) || isDateRangeField(field)) {
    return !isNaN(parseDate(value).getTime());
  }
  // string is always valid
  return true;
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
      const gte = num;
      let lte = range.lte;
      if (lte && lte <= gte) lte = undefined;
      range = { gte, lte };
    } else {
      const lte = num;
      let gte = range.gte;
      if (gte && gte >= lte) gte = undefined;
      range = { gte, lte };
    }
    return { ...query, filter: { ...query.filter, [field]: range } };
  }
  if (isDateField(field) || isDateRangeField(field)) {
    const date = parseDate(value);
    if (isNaN(date.getTime())) return query;
    let range = query.filter[field] || {};
    if (start) {
      const gte = date;
      let lte = range.lte;
      if (lte && lte <= gte) lte = undefined;
      range = { gte, lte };
    } else {
      const lte = date;
      let gte = range.gte;
      if (gte && gte >= lte) gte = undefined;
      range = { gte, lte };
    }
    return { ...query, filter: { ...query.filter, [field]: range } };
  }
  return query;
}

export function getBound(query: IQuery, field: OrderField, start: boolean) {
  const bound = start ? "gte" : "lte";
  const value = (query.filter[field] as any)?.[bound];
  if (!value) return "";
  if (isNaN(value)) return "";
  if (value instanceof Date) {
    return formatDate(value);
  }
  return String(value);
}
