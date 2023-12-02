import rehypeStringify from "rehype-stringify";
import rehypeFormat from "rehype-format";
import rehypeDocument from "rehype-document";
import { Errable, fromSuccess, Success } from "@/server/utils/errable";
import { NoteData } from "../interface";
import { getProcessor } from "./processor";

interface IMDToHTML {
  /** id of note being converted */
  id: string;
  /** parsing metadata */
  idToMeta: Map<string, Errable<NoteData>>;
  /** wether to create a documnet (true) or a fragment (false) */
  document: boolean;
  /** string to use when there is no title */
  untitled: string;
}

type Opts = IMDToHTML;

/**
 * converts markdown to html, either a fragment (if title is undefied)
 * or a document (if title is defined), using previous parsing's metadata
 * assumes opts contians valid metadata about the file
 * @param md - markdown contents
 * @param opts: see interface definition
 * @returns parsed html
 */
export async function mdToHTML(md: string, opts: Opts) {
  let html: string;
  let title = "";
  if (opts.document) {
    const { idToMeta, id } = opts;
    const resRequest = idToMeta.get(id)!;
    if (resRequest._tag === "failure") return resRequest;
    const res = fromSuccess(resRequest);
    title = res.title || opts.untitled;
  }
  let p = getProcessor(opts);
  p = opts.document ? p.use(rehypeDocument, { title }) : p;
  p = p.use(rehypeStringify).use(rehypeFormat);
  const processed = await p.process(md);
  html = String(processed);
  return new Success(html);
}
