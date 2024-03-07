import { optic } from "optics-ts";
import { createHooks } from "./stores";
import { create } from "zustand";
import { nullQuery } from "@/core";

const init = {
  focusedNote: "",
  query: nullQuery,
};

type IState = typeof init;

export const oState = optic<IState>();

export const initSamples = {};

const useBoundStore = create(() => init);

export const useMainStore = createHooks(useBoundStore);
