import { optic } from "optics-ts";
import { createHooks } from "./stores";
import { create } from "zustand";
import { nullQuery } from "@/core";
import { INote } from "@/core/note";
import { nullFilterResults } from "@/core/filters";

export const nullMainStore = {
  focusedNote: "",
  query: nullQuery,
  sorted: [] as INote[],
  results: nullFilterResults,
};

type IState = typeof nullMainStore;

export const oState = optic<IState>();

export const initSamples = {};

const useBoundStore = create(() => nullMainStore);

export const useMainStore = createHooks(useBoundStore);
