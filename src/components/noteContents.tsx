import { contents } from "./noteContents.css";
import { Box } from "./box";
import { getHTML } from "@/server/actions";
import { fromSuccess } from "@/server/utils/errable";
import { NoteHTML } from "./noteHTML";

export async function NoteContents({ id }: { id: string }) {
  const htmlRequest = await getHTML(id, false);
  if (htmlRequest._tag === "failure") {
    return null;
  }
  const html = fromSuccess(htmlRequest);
  return (
    <Box className={contents}>
      <NoteHTML html={html} />
    </Box>
  );
}
