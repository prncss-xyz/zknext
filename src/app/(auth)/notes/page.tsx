import { Box } from "@/components/box";
import { H1 } from "@/components/h1";
import { Link } from "@/components/link";
import type { INote } from "@/core/note";
import { getNotes } from "@/server/actions";

// this prevents scanning notes directory at build time
export const dynamic = "force-dynamic";

function Entry({ note }: { note: INote }) {
  return (
    <Link href={`/notes/${note.id}`}>
      {note.title ? note.title : <Box fontFamily="monospace">note.id</Box>}
    </Link>
  );
}

export default async function Page({}: {}) {
  const notes = await getNotes();
  return (
    <Box display="flex" flexDirection="column">
      <H1>Notes</H1>
      <Box display="flex" flexDirection="column">
        {notes.map((note) => (
          <Entry key={note.id} note={note} />
        ))}
      </Box>
    </Box>
  );
}
