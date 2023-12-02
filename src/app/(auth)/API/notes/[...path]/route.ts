import { getHTML } from "@/server/actions";
import { fromFailure, fromSuccess } from "@/server/utils/errable";

export async function GET(
  _: Request,
  { params: { path } }: { params: { path: string[] } },
) {
  // next will take care of `API/asset/../unauthorized.png`, no need to manually block
  const id = path.join("/");
  const htmlRequest = await getHTML(id, true);
  if (htmlRequest._tag === "failure") {
    return new Response(fromFailure(htmlRequest), { status: 404 });
  }
  const html = fromSuccess(htmlRequest);
  const response = new Response(html);
  response.headers.set("content-type", "text/html");
  return response;
}
