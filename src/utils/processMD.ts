import { Errable } from "@/server/interfaces";
import { NoteData } from "@/server/notes/interface";
import clsx from "clsx";
import { extname } from "path";
import rehypeRaw from "rehype-raw";
import breaks from "remark-breaks";
import emoji from "remark-emoji";
import gfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
// @ts-ignore
import removeComments from "remark-remove-comments";
import smartyPants from "remark-smartypants";
// @ts-ignore
import wikiLink from "remark-wiki-link";
import { unified } from "unified";
import { visit } from "unist-util-visit";

const defaultExtension = ".md";

type ITransform = {
  prefix: string;
  links: Errable<NoteData>[];
} | null;

function transform(opts: ITransform) {
  return async function (tree: any) {
    if (opts) {
      let i = 0;
      visit(tree, "wikiLink", (node: any) => {
        const link = opts.links[i++];
        if (link._tag === "failure") {
          node.data.hProperties.className = clsx({
            internal: true,
            broken: true,
          });
          return;
        }
        const { result } = link;
        node.data.hProperties.className = clsx({
          internal: true,
          titled: result.title,
        });
        node.data.alias = result.title || result.id;
        node.data.hProperties.href = opts.prefix + result.id;
        node.data.hChildren = [
          { type: "text", value: result.title || result.id },
        ];
      });
    }
  };
}

// we need to export this function instead of raw constant for processor to work both on client and server
export function getProcessor(opts: ITransform) {
  return (
    // @ts-ignore
    unified()
      .use(remarkParse)
      .use(transform, opts)
      // @ts-ignore
      .use(wikiLink, {
        hrefTemplate: (permalink: string) => {
          if (!extname(permalink)) permalink += defaultExtension;
          return permalink;
        },
      })
      .use(breaks)
      .use(emoji)
      .use(gfm)
      .use(smartyPants)
      .use(removeComments)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
  );
}
