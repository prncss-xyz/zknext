"use server";

import { notes } from "./liveContainer";

export async function getNotes() {
  return notes.getNotes();
}

export async function getHTML(id: string, body: boolean) {
  return await notes.getHTML(id, body);
}

export async function getNote(id: string) {
  return notes.getNote(id);
}

export async function dump() {
  return await notes.dump();
}
