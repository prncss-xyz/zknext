"use client";

import { createStateCtx } from "@/components/ctx";

export const { Provider: NoteOverlayProvider, useCtx: useNoteOverlay } =
  createStateCtx("");
