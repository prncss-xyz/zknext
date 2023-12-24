"use client";

import { Box, BoxProps } from "@/components/box";
import { useClickOutside } from "@/components/clickOutside";
import { overlay } from "@/components/overlay.css";
import { nullQuery } from "@/core";
import { nullFilter } from "@/core/filters";
import { IDateRange, INote } from "@/core/note";
import { OrderField } from "@/core/sorters";
import { formatDateTime } from "@/utils/dates";
import { upDirs } from "@/utils/path";
import { basename } from "path";
import { ReactNode, useCallback } from "react";
import { NoteContents } from "./noteContents";
import { useNoteOverlay } from "./noteOverlay";
import { useQuery } from "./query";

function Dir({ dir }: { dir: string }) {
  const [_, setId] = useNoteOverlay();
  const { setQuery } = useQuery();
  const onClick = useCallback(() => {
    setQuery({ ...nullQuery, filter: { ...nullFilter, id: dir } });
    setId("");
  }, [dir, setId, setQuery]);
  return (
    <Box as="button" fontFamily="monospace" onClick={onClick}>
      {basename(dir)}
    </Box>
  );
}

function Tag({ tag }: { tag: string }) {
  const [_, setId] = useNoteOverlay();
  const { setQuery } = useQuery();
  const onClick = useCallback(() => {
    setQuery({ ...nullQuery, filter: { ...nullFilter, tags: [tag] } });
    setId("");
  }, [setId, setQuery, tag]);
  return (
    <Box as="button" onClick={onClick}>
      {tag}
    </Box>
  );
}

function OrderValue({ value }: { value: string | number | Date | IDateRange }) {
  if (typeof value === "number" || typeof value === "string") {
    return <Box>{value}</Box>;
  }
  if (value instanceof Date) {
    return <Box>{formatDateTime(value)}</Box>;
  }
  return (
    <Box display="flex" flexDirection="row">
      <Box>{formatDateTime(value?.start)}</Box>
      <Box>-</Box>
      <Box>{formatDateTime(value?.end)}</Box>
    </Box>
  );
}

function Order({ field, note }: { field: OrderField; note: INote }) {
  const value = note[field];
  if (!value) return;
  return (
    <Box display="flex" flexDirection="row" gap={5}>
      <Box width="labelWidth">{field}</Box>
      <OrderValue value={value} />
    </Box>
  );
}

function Orders({ note }: { note: INote }) {
  return (
    <Box display="flex" flexDirection="column">
      <Order field="mtime" note={note} />
      <Order field="wordcount" note={note} />
      <Order field="event" note={note} />
      <Order field="asset" note={note} />
      <Order field="since" note={note} />
      <Order field="due" note={note} />
      <Order field="until" note={note} />
    </Box>
  );
}

function NoteHeader({ note }: { note: INote }) {
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row" alignItems="center" gap={5}>
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
      <Box display="flex" flexDirection="row" gap={5}>
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
  const [id, setId] = useNoteOverlay();
  const active = id === target;
  const navigate = useCallback(() => setId(target), [setId, target]);
  return (
    <ToNoteBox
      as="button"
      color={active ? "active" : undefined}
      onClick={navigate}
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
  const [id] = useNoteOverlay();
  const { notes } = useQuery();
  if (!id) return null;
  const index = notes.findIndex((note) => note.id === id);
  if (index === -1) return;
  return (
    <Box display="flex" flexDirection="row" justifyContent="flex-end" gap={5}>
      <ToNoteOpt target={notes[0]?.id}>first</ToNoteOpt>
      <ToNoteOpt target={notes[index - 1]?.id}>prev</ToNoteOpt>
      <ToNoteOpt target={notes[index + 1]?.id}>next</ToNoteOpt>
      <ToNoteOpt target={notes.at(-1)?.id}>last</ToNoteOpt>
      <ToNoteOpt target="">close</ToNoteOpt>
    </Box>
  );
}

function Note({}: {}) {
  const [id, setId] = useNoteOverlay();
  const close = useCallback(() => setId(""), [setId]);
  const { notes } = useQuery();
  const ref = useClickOutside(close);
  if (!id) return null;
  const index = notes.findIndex((note) => note.id === id);
  if (index === -1) return;
  const note = notes[index];
  return (
    <Box
      ref={ref}
      width="overlayNoteWidth"
      display="flex"
      flexDirection="column"
      backgroundColor="foreground1"
      borderRadius={10}
      borderStyle="all"
      borderColor="background"
      borderWidth={2}
      p={10}
      gap={5}
    >
      <Nav />
      <NoteHeader note={note} />
      <NoteContents id={id} />
    </Box>
  );
}

export function Overlay({}: {}) {
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
