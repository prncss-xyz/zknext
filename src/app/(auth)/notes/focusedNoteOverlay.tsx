"use client";

import clsx from "clsx";
import { sprinkles } from "@/sprinkles.css";
import { Box, BoxProps } from "@/components/box";
import { useClickOutside } from "@/components/clickOutside";
import { overlay } from "@/components/overlay.css";
import { INote, RangeField, NumberField } from "@/core/note";
import { OrderField } from "@/core/sorters";
import { upDirs } from "@/utils/path";
import { basename } from "path";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { NoteHTML } from "@/components/noteContents";
import {
  LuChevronFirst,
  LuChevronLast,
  LuChevronLeft,
  LuChevronRight,
  LuX,
} from "react-icons/lu";
import { dateString } from "@/utils/encodec";
import { useMainStore } from "@/components/store";
import {
  oDir,
  oSorted,
  oFocused,
  oFocusedNote,
  oFocusedIndex,
  getOTag,
  oSort,
} from "@/utils/optics";
import { getHTML } from "@/server/actions";

function Dir({ dir }: { dir: string }) {
  const onClick = useMainStore.setWith([oDir, dir], [oFocused, ""]);
  return (
    <Box as="button" fontFamily="monospace" onClick={onClick}>
      {basename(dir)}
    </Box>
  );
}

function Tag({ tag }: { tag: string }) {
  const o = useMemo(() => getOTag(tag), [tag]);
  const onClick = useMainStore.setWith([oFocused, ""], [o, true]);
  return (
    <Box
      as="button"
      onClick={onClick}
      display="flex"
      flexDirection="row"
      alignItems="baseline"
      justifyContent="center"
      borderRadius={2}
      backgroundColor="foreground2"
      px={5}
      height="buttonHeight"
    >
      {tag}
    </Box>
  );
}

function useOrder<T extends OrderField>(field: T, note: INote) {
  const value = note[field];
  const onClick = useMainStore.setWith(
    [oFocused, ""],
    [oSort, { field, asc: true }],
  );
  return [onClick, value] as const;
}

function OrderLayout({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Box display="flex" flexDirection="row" gap={5}>
      <Box as="button" onClick={onClick} width="labelWidth">
        {label}
      </Box>
      {children}
    </Box>
  );
}

function OrderNumber({ field, note }: { field: NumberField; note: INote }) {
  const [onClick, value] = useOrder(field, note);
  if (!value) return;
  return (
    <OrderLayout label={field} onClick={onClick}>
      <Box>{value}</Box>
    </OrderLayout>
  );
}

function OrderDate({ field, note }: { field: NumberField; note: INote }) {
  const [onClick, value] = useOrder(field, note);
  if (!value) return;
  return (
    <OrderLayout label={field} onClick={onClick}>
      <Box>{dateString.encode(value)}</Box>
    </OrderLayout>
  );
}

function OrderRange({ field, note }: { field: RangeField; note: INote }) {
  const [onClick, value] = useOrder(field, note);
  if (!value) return;
  return (
    <OrderLayout label={field} onClick={onClick}>
      <Box display="flex" flexDirection="row">
        <Box>{value.start && dateString.encode(value.start)}</Box>
        <Box>-</Box>
        <Box>{value.end && dateString.encode(value.end)}</Box>
      </Box>
    </OrderLayout>
  );
}

function Orders({ note }: { note: INote }) {
  return (
    <Box display="flex" flexDirection="column">
      <OrderDate field="mtime" note={note} />
      <OrderNumber field="wordcount" note={note} />
      <OrderRange field="event" note={note} />
      <OrderDate field="since" note={note} />
      <OrderDate field="due" note={note} />
      <OrderDate field="until" note={note} />
    </Box>
  );
}

function NoteHeader({ note }: { note: INote }) {
  return (
    <Box display="flex" flexDirection="column" gap={10}>
      <Box display="flex" flexDirection="row" alignItems="baseline" gap={5}>
        {upDirs(false, note.id)
          .slice(1)
          .map((dir) => (
            <>
              <Dir dir={dir} />
              <Box>{"/"}</Box>
            </>
          ))}
        <Box fontFamily="monospace">{basename(note.id)}</Box>
      </Box>
      <Box display="flex" flexDirection="row" alignItems="baseline" gap={5}>
        {note.tags.map((tag) => (
          <Tag key={tag} tag={tag} />
        ))}
      </Box>
      <Orders note={note} />
    </Box>
  );
}

function ToNoteBox({ children, ...props }: { children: ReactNode } & BoxProps) {
  return <Box {...props}>{children}</Box>;
}

function ToNote({
  target,
  children,
  ...props
}: { target: string; children: ReactNode } & BoxProps) {
  const [active, navigate] = useMainStore.activate(oFocused, target);
  return (
    <ToNoteBox
      as="button"
      onClick={navigate}
      className={clsx({ [sprinkles({ color: "active" })]: active })}
      {...props}
    >
      {children}
    </ToNoteBox>
  );
}

function ToNoteOpt({
  target,
  children,
  ...props
}: { target?: string; children: ReactNode } & BoxProps) {
  return target === undefined ? (
    <ToNoteBox {...props}>{children}</ToNoteBox>
  ) : (
    <ToNote target={target} {...props}>
      {children}
    </ToNote>
  );
}

function Nav({}: {}) {
  const notes = useMainStore.get(oSorted);
  const index = useMainStore.get(oFocusedIndex);
  const first = notes[0]?.id;
  const prev = notes[index - 1]?.id;
  const next = notes[index + 1]?.id;
  const last = notes.at(-1)?.id;
  return (
    <Box display="flex" flexDirection="row" justifyContent="flex-end" gap={5}>
      <ToNoteOpt target={first}>
        <LuChevronFirst />
      </ToNoteOpt>
      <ToNoteOpt target={prev}>
        <LuChevronLeft />
      </ToNoteOpt>
      <ToNoteOpt target={next}>
        <LuChevronRight />
      </ToNoteOpt>
      <ToNoteOpt target={last}>
        <LuChevronLast />
      </ToNoteOpt>
      <ToNoteOpt target="">
        <LuX />
      </ToNoteOpt>
    </Box>
  );
}

function Note({}: {}) {
  const close = useMainStore.setWith([oFocused, ""]);
  const ref = useClickOutside(close);
  const note = useMainStore.get(oFocusedNote);
  const [html, setHTMLRequest] = useState<string>();
  const id = useMainStore.get(oFocused);
  useEffect(() => {
    id &&
      getHTML(id, false).then((res) => {
        if (res) setHTMLRequest(res);
      });
  }, [id]);
  if (!note) return;
  if (html === undefined) return;
  return (
    <Box
      ref={ref}
      width="overlayNoteWidth"
      backgroundColor="foreground1"
      borderColor="background"
      borderRadius={10}
      borderStyle="all"
      borderWidth={2}
      p={10}
      display="flex"
      flexDirection="column"
      gap={5}
    >
      <Nav />
      <NoteHeader note={note} />
      <NoteHTML html={html} />
    </Box>
  );
}

export function FocusedNoteOverlay({}: {}) {
  return (
    <Box className={overlay}>
      <Box
        width="100%"
        display="flex"
        flexDirection="row"
        justifyContent="flex-end"
      >
        <Note />
      </Box>
    </Box>
  );
}
