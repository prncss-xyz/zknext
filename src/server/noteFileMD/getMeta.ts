import { visitParents } from "unist-util-visit-parents";
import { toHtml } from "hast-util-to-html";
import { toText } from "hast-util-to-text";
import { remove } from "unist-util-remove";
import { wordsCount } from "words-count";
import { Element, Root } from "hast";
import { normalizePath } from "@/utils/path";
import { getMatter, getProcessor } from "./processor";
import { Errable, Failure, Success } from "@/utils/errable";
import { fromPreamble } from "./fromPreamble";
import { INote, nullNote } from "@/core/note";

interface FileData {
  id: string;
  mtime: number;
}

interface RawLink {
  context: string;
  target: string;
  position: Element["position"];
  title: string;
}

interface AnalyzeResult {
  title: string;
  links: RawLink[];
  rawText: string;
  wordcount: number;
}

function analyse(tree: Root): AnalyzeResult {
  const links: RawLink[] = [];
  let title: string = "";
  visitParents(tree, "element", function (node, ancestors) {
    if (node.tagName === "h1") {
      title = toText(node as any);
      return;
    }
    if (node.tagName === "a") {
      const target = node.properties?.href;
      const className = node?.properties?.className;
      const position = node.position;
      if (
        typeof target === "string" &&
        position &&
        (className === "internal" ||
          (Array.isArray(className) && className.includes("internal")))
      ) {
        for (let i = ancestors.length; i--; i > 0) {
          const ancestor = ancestors[i];
          // finds the enclosing p
          if (
            ancestor.type == "element" &&
            ["p", "li", "dt", "dd"].includes(ancestor.tagName)
          ) {
            const context = toHtml(ancestor.children as any);
            links.push({
              context,
              target,
              position,
              title,
            });
            break;
          }
        }
        return;
      }
    }
  });
  remove(
    tree,
    (node: any) =>
      node.type === "element" &&
      node.tagName === "a" &&
      node?.properties.className?.includes("internal"),
  );
  const rawText = toText(tree as any);
  // wiki link titles arbitrarily count as one word
  const wordcount = wordsCount(rawText) + links.length;
  return { title, links, rawText, wordcount };
}

function spit() {
  // @ts-ignore
  this.Compiler = analyse;
}

export interface AnalyzeMDOpts {
  prefix: string;
}

export async function getMeta(
  fileData: FileData,
  raw: string,
): Promise<Errable<INote>> {
  const processor = getProcessor(null).use(spit);
  const result = (await processor.process(raw)).result as AnalyzeResult;
  const { title, wordcount, links: links_ } = result;
  const links = links_.map((link) => ({
    target: normalizePath(link.target),
    context: link.context,
  }));
  let preamble: unknown;
  try {
    preamble = getMatter(raw, {});
  } catch (err) {
    return new Failure("syntax error (preamble)");
  }
  let validated: ReturnType<typeof fromPreamble>;
  try {
    validated = fromPreamble(preamble);
  } catch (err) {
    return new Failure("invalid data (preamble)");
  }
  return new Success({
    ...nullNote,
    ...fileData,
    ...validated,
    title,
    wordcount,
    links,
  });
}
