import { Box } from "@/components/box";
import { NoteContents } from "@/components/noteContents";
import { getNote } from "@/server/actions";

// this prevents scanning notes directory at build time
export const dynamic = "force-dynamic";

function Failure({ message }: { message: string }) {
  return (
    <Box>
      The note has error <code>{message}</code>.
    </Box>
  );
}

export async function Note({ id }: { id: string }) {
  const note = await getNote(id);
  if (note._tag === "failure") return <Failure message={note.message} />;
  return <NoteContents id={id} />;
}

export default async function Page({
  params: { path },
}: {
  params: { path: string[] };
}) {
  const id = path.join("/");
  return (
    <Box display="flex" flexDirection="column">
      <code>{id}</code>
      <Note id={id} />
    </Box>
  );
}
