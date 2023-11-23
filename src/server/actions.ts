"use server";

import { notes } from "./liveContainer";

export async function getNotes() {
  return notes.getNotes();
}
