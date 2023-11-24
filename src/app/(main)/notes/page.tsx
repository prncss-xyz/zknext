import { Box } from "@/components/box";
import { H1 } from "@/components/h1";
import { getNotes } from "@/server/actions";

// this prevents scanning notes directory at build time
export const dynamic = "force-dynamic";

export default async function Page({}: {}) {
  const notes = await getNotes();
  return (
    <Box display="flex" flexDirection="column">
      <H1>Notes</H1>
      <Box display="flex" flexDirection="column">
        {notes.map((note) => (
          <Box key={note.id}>{note.id}</Box>
        ))}
      </Box>
    </Box>
  );
}
