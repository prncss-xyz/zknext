"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { LuLink, LuExternalLink } from "react-icons/lu";
import { luLink, luExternalLink } from "./noteContents.css";
import { HTML } from "./html";

function A({
  href,
  className,
  children,
}: {
  href?: string;
  className?: string;
  children?: ReactNode;
}) {
  if ((className?.split(" ") ?? []).includes("internal") && href) {
    return (
      <Link href={href} className={className}>
        <LuLink className={luLink} />
        {children}
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

const components = {
  a: A,
};

export function NoteHTML({ html }: { html: string }) {
  return <HTML html={html} components={components} />;
}
