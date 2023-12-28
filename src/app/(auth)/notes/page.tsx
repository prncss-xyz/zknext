import { getNotes } from "@/server/actions";
import { Notes } from "./notes";
import { Overlay } from "./note";
import { ResultsProvider } from "./results";

// this prevents scanning notes directory at build time
export const dynamic = "force-dynamic";

export default async function Page({}: {}) {
  const notes = await getNotes();
  return (
    <ResultsProvider notes={notes}>
      <Overlay />
      <Notes />
    </ResultsProvider>
  );
}
