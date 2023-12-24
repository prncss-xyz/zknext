import { getNotes } from "@/server/actions";
import { Notes } from "./notes";
import { NoteOverlayProvider } from "@/app/(auth)/notes/noteOverlay";
import { QueryProvider } from "./query";
import { Overlay } from "./note";

// this prevents scanning notes directory at build time
export const dynamic = "force-dynamic";

export default async function Page({}: {}) {
  const notes = await getNotes();
  return (
    <QueryProvider notes={notes}>
      <NoteOverlayProvider>
        <Overlay />
        <Notes />
      </NoteOverlayProvider>
    </QueryProvider>
  );
}
