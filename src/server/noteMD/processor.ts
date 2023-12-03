import clsx from "clsx";
import { dirname, extname, relative } from "node:path";
import rehypeRaw from "rehype-raw";
import breaks from "remark-breaks";
import emoji from "remark-emoji";
import remarkFrontmatter from "remark-frontmatter";
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
import * as yaml from "js-yaml";
import { NoteData } from "@/core";
import { Errable, fromSuccess } from "@/utils/errable";

const defaultExtension = ".md";

export interface ITransform {
  id: string;
  idToMeta: Map<string, Errable<NoteData>>;
}

function transform(opts: ITransform | null) {
  return async function (tree: any) {
    if (!opts) return;
    const { idToMeta, id } = opts;
    const dir = dirname(id);
    const { links } = fromSuccess(idToMeta.get(id)!);
    let i = 0;
    if (idToMeta) {
      visit(tree, "wikiLink", (node: any) => {
        const link_ = links[i++];
        const link = idToMeta.get(link_.target);
        if (!link || link._tag === "failure") {
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
        const value = result.title || result.id;
        node.data.alias = value;
        node.data.hProperties.href = relative(dir, result.id);
        node.data.hChildren = [{ type: "text", value }];
      });
    }
  };
}

// we need to export this function instead of raw constant for processor to work both on client and server
export function getProcessor(opts: ITransform | null) {
  return (
    unified()
      .use(remarkParse)
      .use(remarkFrontmatter)
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

function analyse(tree: any) {
  const node = tree.children.find((n: any) => n.type === "yaml");
  return ((node as any)?.value || "") as string;
}

function spit() {
  // @ts-ignore
  this.Compiler = analyse;
}

const matterProcessor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(spit);

export function getMatter(md: string, def: unknown) {
  const matter = matterProcessor.processSync(md).toString();
  return matter ? yaml.load(matter) : def;
}
