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
  const { queried, restrict } = useMemo(() => {
    const { notes: queried, restrict } = applyFilter(
      nullApplyFilterOpts,
      query.filter,
      notes,
    );
    queried.sort(getSorter(query.sort));
    return { queried, restrict };
  }, [notes, query.filter, query.sort]);
  return { notes: queried, query, setQuery, restrict } as const;
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
