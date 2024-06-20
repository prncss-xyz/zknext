import { create } from "zustand";
import { nullQuery } from "@/core";
import { INote } from "@/core/note";
import { nullFilterResults } from "@/core/filters";
import { dequal } from "dequal";
import { withOptics } from "@prncss-xyz/zustand-optics";

export const nullMainStore = {
  focusedNote: "",
  query: nullQuery,
  sorted: [] as INote[],
  results: nullFilterResults,
};

export type IState = typeof nullMainStore;

export const initSamples = {};

const useBoundStore = create(() => nullMainStore);

export const useMainStore = withOptics(useBoundStore, dequal);
