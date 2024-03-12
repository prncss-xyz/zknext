import { getNotes } from "@/server/actions";
import { Notes } from "./notes";
import { FocusedNoteOverlay } from "./focusedNoteOverlay";
import { ComputedValues } from "./computedValues";
import { Box } from "@/components/box";
import { Navigator } from "./navigator";

// this prevents scanning notes directory at build time
export const dynamic = "force-dynamic";

export default async function Page({}: {}) {
  const notes = await getNotes();
  return (
    <Box display="flex" flexDirection="column">
      <ComputedValues notes={notes} />
      <FocusedNoteOverlay />
      <Box
        mx={5}
        my={10}
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={10}
      >
        <Navigator />
        <Notes />
      </Box>
    </Box>
  );
}
