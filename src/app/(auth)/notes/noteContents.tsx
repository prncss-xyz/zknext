"use client";

import { luLink, luExternalLink, contents } from "./noteContents.css";
import { getHTML } from "@/server/actions";
import { useEffect, useState } from "react";
import { Box } from "@/components/box";
import { ReactNode } from "react";
import { LuLink, LuExternalLink } from "react-icons/lu";
import { HTML } from "@/components/html";
import { oState, useMainStore } from "@/components/store";

export function NoteContents({ id }: { id: string }) {
  const [html, setHTMLRequest] = useState<string>();
  useEffect(() => {
    getHTML(id, false).then((res) => {
      if (res) setHTMLRequest(res);
    });
  }, [id]);
  if (!html) return null;
  return (
    <Box className={contents}>
      <NoteHTML html={html} />
    </Box>
  );
}

const oFocused = oState.prop("focusedNote");
function InnerLink({
  target,
  className,
  children,
}: {
  target: string;
  className?: string;
  children: ReactNode;
}) {
  const navigate = useMainStore.setValue(oFocused, target);
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
  return <HTML html={html} components={components} />;
}
