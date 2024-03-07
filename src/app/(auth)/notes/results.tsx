"use client";

import { createValueCtx } from "@/components/ctx";
import { applyFilter, nullApplyFilterOpts } from "@/core/filters";
import { INote } from "@/core/note";
import { getSorter } from "@/core/sorters";
import { ReactNode, useMemo } from "react";
import { useMainStore } from "@/components/store";
import { oQuery } from "@/utils/optics";

type Results = ReturnType<typeof applyFilter>;
const { Provider: ResultsProvider_, useCtx: useResults_ } =
  createValueCtx<Results>();

export function ResultsProvider({
  notes,
  children,
}: {
  notes: INote[];
  children: ReactNode;
}) {
  const query = useMainStore.get(oQuery);
  const value = useMemo(() => {
    const results = applyFilter(nullApplyFilterOpts, query.filter, notes);
    results.notes.sort(getSorter(query.sort));
    return results;
  }, [notes, query.filter, query.sort]);
  return <ResultsProvider_ value={value}>{children}</ResultsProvider_>;
}

export const useResults = useResults_;
