"use client"

import { luLink, luExternalLink, contents } from "./noteContents.css";
import { getHTML } from "@/server/actions";
import { Errable, fromSuccess } from "@/utils/errable";
import { useEffect, useState } from "react";
import { Box } from "@/components/box";
import { ReactNode, useCallback } from "react";
import { LuLink, LuExternalLink } from "react-icons/lu";
import { HTML } from "@/components/html";
import { useNoteOverlay } from "./noteOverlay";

function Failure({ message }: { message: string }) {
  return (
    <Box>
      The note has error <code>{message}</code>.
    </Box>
  );
}

export function NoteContents({ id }: { id: string }) {
  const [htmlRequest, setHTMLRequest] = useState<Errable<string>>();
  useEffect(() => {
    getHTML(id, false).then(setHTMLRequest);
  }, [id]);
  if (!htmlRequest) return null;
  if (htmlRequest._tag === "failure")
    return <Failure message={htmlRequest.message} />;
  const html = fromSuccess(htmlRequest);
  return (
    <Box className={contents}>
      <NoteHTML html={html} />
    </Box>
  );
}

function InnerLink({
  target,
  className,
  children,
}: {
  target: string;
  className?: string;
  children: ReactNode;
}) {
  const [, setId] = useNoteOverlay();
  const navigate = useCallback(() => setId(target), [setId, target]);
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
