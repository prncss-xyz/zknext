import { LuExternalLink, LuLink } from "react-icons/lu";
import { luExternalLink, luLink, contents as md } from "./md.css";
import { createElement, Fragment, ReactNode } from "react";
import rehypeReact from "rehype-react";
import { Link } from "./link";
import { getProcessor } from "@/utils/processMD";
import { Box } from "./box";
import { getNote } from "@/server/actions";

// This is used while rendering markdown contents. It intecepts internal links to render them as `Link` elements
async function A({
  href,
  className,
  children,
}: {
  href?: string;
  className?: string;
  children?: ReactNode;
}) {
  const prefix = "/notes/";
  if ((className?.split(" ") ?? []).includes("internal") && href) {
    console.log(href);
    const note = await getNote(href);
    const title = (note._tag === "success" && note.result.title) ?? "";
    return (
      <Link href={prefix + href} className={className}>
        <LuLink className={luLink} />
        {title ? title : children}
      </Link>
    );
  }
  if (href?.startsWith("/"))
    return (
      <Link href={href} className={className}>
        <LuLink className={luLink} />
        {children}
      </Link>
    );
  return (
    <a href={href} className={className} target="_blank">
      <LuExternalLink className={luExternalLink} />
      {children}
    </a>
  );
}

export async function MD({
  contents,
  prefix,
}: {
  contents: string;
  prefix: string;
}) {
  const processor = getProcessor({ prefix: "" }).use(rehypeReact, {
    createElement,
    Fragment,
    components: {
      a: A,
    },
  });
  const { result } = await processor.process(contents);
  return <Box className={md}>{result}</Box>;
}
