"use client";

import { luLink, luExternalLink, contents } from "./noteContents.css";
import { Box } from "@/components/box";
import { ReactNode, useCallback } from "react";
import { LuLink, LuExternalLink } from "react-icons/lu";
import { HTML } from "@/components/html";
import { useMainStore } from "@/components/store";
import { oFocused } from "@/utils/optics";

function InnerLink({
  target,
  className,
  children,
}: {
  target: string;
  className?: string;
  children: ReactNode;
}) {
  const navigate = useCallback(() => useMainStore.set(oFocused)(target), [target]);
  return (
    <button onClick={navigate} className={className}>
      {children}
    </button>
  );
}

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
      <InnerLink target={href} className={className}>
        <LuLink className={luLink} />
        {children}
      </InnerLink>
    );
  }
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
  return (
    <Box className={contents}>
      <HTML html={html} components={components} />
    </Box>
  );
}
