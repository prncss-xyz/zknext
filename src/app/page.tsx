import { Box } from "@/components/box";
import { getNotes } from "@/server/actions";

// this prevents scanning notes directory at build time
export const dynamic = "force-dynamic";

export default async function Page({}: {}) {
  const notes = await getNotes();
  return (
    <Box display="flex" flexDirection="column">
      <Box as="h1" fontWeight="bold">Notes</Box>
      <Box display="flex" flexDirection="column">
        {notes.map((note) => (
          <Box key={note.id}>{note.id}</Box>
        ))}
      </Box>
    </Box>
  );
}
