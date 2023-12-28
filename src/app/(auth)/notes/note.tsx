"use client";
import * as O from "optics-ts";

import clsx from "clsx";
import { sprinkles } from "@/sprinkles.css";
import { Box, BoxProps } from "@/components/box";
import { useClickOutside } from "@/components/clickOutside";
import { overlay } from "@/components/overlay.css";
import { IQuery, nullQuery } from "@/core";
import { IDateRange, INote, NumberField } from "@/core/note";
import { OrderField } from "@/core/sorters";
import { formatDateTime } from "@/utils/dates";
import { upDirs } from "@/utils/path";
import { basename } from "path";
import { ReactNode, useCallback } from "react";
import { NoteContents } from "./noteContents";
import {
  LuChevronFirst,
  LuChevronLast,
  LuChevronLeft,
  LuChevronRight,
  LuX,
} from "react-icons/lu";
import { useResults } from "./results";
import { queryStore, useStr } from "@/components/store";

function Dir({ dir }: { dir: string }) {
  const focusClose = useStr.focusDir.set(dir);
  return (
    <Box as="button" fontFamily="monospace" onClick={focusClose}>
      {basename(dir)}
    </Box>
  );
}

function Tag({ tag }: { tag: string }) {
  const focusClose = useStr.focusTag.set(tag);
  return (
    <Box
      as="button"
      onClick={focusClose}
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

function OrderNumber({ field, note }: { field: NumberField; note: INote }) {
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
  const id = useStr.focusedNote.get();
  const navigate = useStr.focusedNote.set("");
  const active = id === target;
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

function getNavNotes(index: number, notes: INote[]) {
  return {
    first: notes[0]?.id,
    prev: notes[index - 1]?.id,
    next: notes[index + 1]?.id,
    last: notes.at(-1)?.id,
  };
}

function Nav({}: {}) {
  const id = useStr.focusedNote.get();
  const { notes } = useResults();
  const index = notes.findIndex((note) => note.id === id);
  if (!index) return;
  const navNotes = getNavNotes(index, notes);
  return (
    <Box display="flex" flexDirection="row" justifyContent="flex-end" gap={5}>
      <ToNoteOpt target={navNotes.first}>
        <LuChevronFirst />
      </ToNoteOpt>
      <ToNoteOpt target={navNotes.prev}>
        <LuChevronLeft />
      </ToNoteOpt>
      <ToNoteOpt target={navNotes.next}>
        <LuChevronRight />
      </ToNoteOpt>
      <ToNoteOpt target={navNotes.last}>
        <LuChevronLast />
      </ToNoteOpt>
      <ToNoteOpt target="">
        <LuX />
      </ToNoteOpt>
    </Box>
  );
}

function Note({}: {}) {
  const [id, close] = useStr.focusedNote.rw("");
  const { notes } = useResults();
  const ref = useClickOutside(close);
  if (!id) return null;
  const index = notes.findIndex((note) => note.id === id);
  if (index === -1) return;
  const note = notes[index];
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
