"use client";

import {
  IFilter,
  applyFilter,
  nullApplyFilterOpts,
  nullFilter,
} from "@/core/filters";
import { INote } from "@/core/note";
import { ISort, getSorter, nullSort } from "@/core/sorters";
import { ReactNode, createContext, useContext, useMemo, useState } from "react";

export interface IQuery {
  sort: ISort;
  filter: IFilter;
}

function useQueried(notes: INote[]) {
  const [query, setQuery] = useState<IQuery>({
    filter: nullFilter,
    sort: nullSort,
  });
  const sorted = useMemo(
    () => notes.filter(() => true).sort(getSorter(query.sort)),
    [notes, query.sort],
  );
  return [sorted, query, setQuery] as const;
}

const QueryContext = createContext<ReturnType<typeof useQueried> | null>(null);

export function useQuery() {
  const res = useContext(QueryContext);
  if (!res) throw new Error("useNotes must be used within NotesProvider");
  return res;
}

export function QueryProvider({
  notes,
  children,
}: {
  notes: INote[];
  children: ReactNode;
}) {
  return (
    <QueryContext.Provider value={useQueried(notes)}>
      {children}
    </QueryContext.Provider>
  );
}

export function stringifySort(sort: ISort) {
  return JSON.stringify(sort)
}

export function destringifySort(str: string): ISort {
  // TODO: runtime check
  return JSON.parse(str) as ISort
}
