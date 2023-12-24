"use client";

import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

type INoteOverlay = string;
const name = "NoteOverlay";

const NoteOverlayContext = createContext<
  [INoteOverlay, Dispatch<SetStateAction<INoteOverlay>>] | undefined
>(undefined);

export function NoteOverlayProvider({ children }: { children: ReactNode }) {
  const value = useState("");
  return (
    <NoteOverlayContext.Provider value={value}>
      {children}
    </NoteOverlayContext.Provider>
  );
}

export function useNoteOverlay() {
  const value = useContext(NoteOverlayContext);
  if (!value) throw new Error(`${name} must be used in a provider`);
  return value;
}
