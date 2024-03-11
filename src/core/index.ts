import { IFilter, nullFilter } from "./filters";
import { ISort, nullSort } from "./sorters";

export interface IQuery {
  sort: ISort;
  filter: IFilter;
}

export const nullQuery: IQuery = {
  sort: nullSort,
  filter: nullFilter,
};
