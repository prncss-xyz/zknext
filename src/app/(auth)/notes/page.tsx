import { getNotes } from "@/server/actions";
import { Notes } from "./notes";
import { Overlay } from "./note";
import { ComputedValues } from "./computedValues";
import { Box } from "@/components/box";

// this prevents scanning notes directory at build time
export const dynamic = "force-dynamic";

export default async function Page({}: {}) {
  const notes = await getNotes();
  return (
    <Box display="flex" flexDirection="column">
      <ComputedValues notes={notes} />
      <Overlay />
      <Notes />
    </Box>
  );
}
