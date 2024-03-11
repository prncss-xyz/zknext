"use client";

import { applyFilter, nullApplyFilterOpts } from "@/core/filters";
import { INote } from "@/core/note";
import { getSorter } from "@/core/sorters";
import { useEffect } from "react";
import { useMainStore } from "@/components/store";
import { oFilter, oFiltered, oResults, oSort, oSorted } from "@/utils/optics";

export function ComputedValues({ notes }: { notes: INote[] }) {
  const filter = useMainStore.get(oFilter);
  const filtered = useMainStore.get(oFiltered);
  const sort = useMainStore.get(oSort);
  const updateResults = useMainStore.set(oResults);
  const updateSorted = useMainStore.set(oSorted);
  useEffect(() => {
    updateResults(applyFilter(nullApplyFilterOpts, filter, notes));
  }, [updateResults, notes, filter]);
  useEffect(() => {
    updateSorted(filtered.toSorted(getSorter(sort)));
  }, [filtered, sort, updateSorted]);
  return null;
}
