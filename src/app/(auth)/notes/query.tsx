"use client";

import { createStateCtx } from "@/components/ctx";
import { nullQuery } from "@/core";
import { IFilter } from "@/core/filters";
import { ISort } from "@/core/sorters";

export interface IQuery {
  sort: ISort;
  filter: IFilter;
}

export const { Provider: QueryProvider, useCtx: useQuery } =
  createStateCtx<IQuery>(nullQuery);
