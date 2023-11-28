import { Box } from "@/components/box";
import { H1 } from "@/components/h1";
import { Link } from "@/components/link";
import { getNotes } from "@/server/actions";
import { NoteData } from "@/server/notes/interface";

// this prevents scanning notes directory at build time
export const dynamic = "force-dynamic";

function Entry({ note }: { note: NoteData }) {
  return (
    <Link href={`/notes/${note.id}`}>
      {note.title ? note.title : <i>note.id</i>}
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
