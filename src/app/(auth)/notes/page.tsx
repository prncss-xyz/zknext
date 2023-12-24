import { getNotes } from "@/server/actions";
import { Notes } from "./entries";
import { NoteOverlayProvider } from "@/app/(auth)/notes/noteOverlay";
import { QueryProvider } from "./query";

// this prevents scanning notes directory at build time
export const dynamic = "force-dynamic";

export default async function Page({}: {}) {
  const notes = await getNotes();
  return (
    <QueryProvider notes={notes}>
      <NoteOverlayProvider>
        <Notes />
      </NoteOverlayProvider>
    </QueryProvider>
  );
}
