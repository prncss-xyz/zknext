"use server";

import { notes } from "./liveContainer";

export async function getNotes() {
  return notes.getNotes();
}

export async function getHTML(id: string, body: boolean) {
  const res = await notes.getHTML(id, body);
  if (res._tag === "success") return res.result;
  return "";
}

export async function getNote(id: string) {
  return notes.getNote(id);
}
