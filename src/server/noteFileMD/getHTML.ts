import rehypeStringify from "rehype-stringify";
import rehypeFormat from "rehype-format";
import rehypeDocument from "rehype-document";
import { getProcessor } from "./processor";
import { INoteGetHTMLOpts } from "../interface";

/**
 * converts markdown to html, either a fragment (if title is undefied)
 * or a document (if title is defined), using previous parsing's metadata
 * assumes opts contians valid metadata about the file
 * @param md - markdown contents
 * @param opts: see interface definition
 * @returns parsed html
 */
export async function getHTML(opts: INoteGetHTMLOpts, md: string) {
  let title = "";
  if (opts.document) {
    const { idToMeta, id } = opts;
    const res = idToMeta.get(id)!;
    if (!res) return "";
    title = res.title || opts.untitled;
  }
  let p: any = getProcessor(opts);
  p = opts.document ? p.use(rehypeDocument, { title }) : p;
  p = p.use(rehypeStringify).use(rehypeFormat);
  const processed = await p.process(md);
  return String(processed);
}
