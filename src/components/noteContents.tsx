import { contents } from "./noteContents.css";
import { Box } from "./box";
import { getHTML } from "@/server/actions";
import { NoteHTML } from "./noteHTML";
import { fromSuccess } from "@/utils/errable";

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
