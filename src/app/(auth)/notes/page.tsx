import { getNotes } from "@/server/actions";
import { QueryProvider } from "@/app/components/notes";
import { Notes } from "./entries";

// this prevents scanning notes directory at build time
export const dynamic = "force-dynamic";

export default async function Page({}: {}) {
  const notes = await getNotes();
  return (
    <QueryProvider notes={notes}>
      <Notes />
    </QueryProvider>
  );
}
