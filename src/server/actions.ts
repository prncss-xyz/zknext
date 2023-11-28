"use server";

import { notes } from "./liveContainer";

export async function getNotes() {
  return notes.getNotes();
}

export async function getNote(id: string) {
  return notes.getNote(id);
}

export async function getLinks(id: string) {
  return notes.getLinks(id);
}
