"use client";

import * as O from "optics-ts";
import { LuChevronUp, LuChevronDown, LuCheck } from "react-icons/lu";
import clsx from "clsx";
import { Box } from "@/components/box";
import { INote, isStringField, optFields } from "@/core/note";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { ISort, OrderField } from "@/core/sorters";
import { getBound, isValidBound, nullQuery, setBound, IQuery } from "@/core";
import { Clear } from "@/components/clear";
import { RoundedButtonOpt } from "@/components/roundedButtonOpt";
import { Label } from "@/components/label";
import { SmallButtonOpt } from "@/components/smallButtonOpt";
import { ButtonOpt } from "@/components/buttonOpt";
import { oState, useMainStore } from "@/components/store";
import {
  oAsc,
  oDir,
  oField,
  oSort,
  getOTag,
  oTags,
  oView,
  oQuery,
  oHidden,
  neg,
} from "@/utils/optics";
import { useResults } from "./results";

const oFocused = oState.prop("focusedNote");
function Entry({ note }: { note: INote }) {
  const [id, activate] = useMainStore.lensValue(oFocused, note.id);
  const active = id === note.id;
  return (
    <ButtonOpt
      active={active}
      navigate={activate}
      fontFamily={note.title ? undefined : "monospace"}
    >
      {note.title ?? note.id}
    </ButtonOpt>
  );
}

/*
function Bound_({ field, start }: { field: OrderField; start: boolean }) {
  const [query, setQuery] = useQuery();
  const bound = getBound(query, field, start);
  const [value, setValue] = useState(bound);
  // this is needed beacuse the contents of bound can be either last edited contents or a value corresponding to last update of query
  useEffect(() => {
    setValue(bound);
  }, [bound]);
  const valid = isValidBound(field, value);
  const register = useCallback(() => {
    if (!value) return;
    setQuery(setBound(query, field, start, value));
  }, [field, query, setQuery, start, value]);
  const keyDownHandler = useCallback(
    (event: any) => {
      const key: string = event.key;
      if (key !== "Enter") return;
      register();
    },
    [register],
  );
  if (isStringField(field)) return <Box width="navInputWidth" />;
  return (
    <Box
      as="input"
      color={valid ? "muted" : "error"}
      width="navInputWidth"
      textAlign="center"
      backgroundColor="foreground2"
      borderRadius={2}
      px={2}
      value={value}
      onKeyDown={keyDownHandler}
      onChange={(e: any) => {
        const value_ = String(e.target.value);
        return setValue(value_);
      }}
      onBlur={register}
    />
  );
}
*/

/*
function Bound({ field, start }: { field: OrderField; start: boolean }) {
  const [query, setQuery] = useQuery();
  const bound = getBound(query, field, start);
  const [value, setValue] = useState(bound);
  // this is needed beacuse the contents of bound can be either last edited contents or a value corresponding to last update of query
  useEffect(() => {
    setValue(bound);
  }, [bound]);
  const valid = isValidBound(field, value);
  const register = useCallback(() => {
    if (!value) return;
    setQuery(setBound(query, field, start, value));
  }, [field, query, setQuery, start, value]);
  const keyDownHandler = useCallback(
    (event: any) => {
      const key: string = event.key;
      if (key !== "Enter") return;
      register();
    },
    [register],
  );
  if (isStringField(field)) return <Box width="navInputWidth" />;
  return (
    <Box
      as="input"
      color={valid ? "muted" : "error"}
      width="navInputWidth"
      textAlign="center"
      backgroundColor="foreground2"
      borderRadius={2}
      px={2}
      value={value}
      onKeyDown={keyDownHandler}
      onChange={(e: any) => {
        const value_ = String(e.target.value);
        return setValue(value_);
      }}
      onBlur={register}
    />
  );
}
*/

/*
function QueryCheckBox({ field }: { field: OrderField }) {
  const [query, setQuery] = useQuery();
  const active = isActiveField(query, field);
  const toggle = useCallback(
    () =>
      active
        ? setQuery(deActivateField(query, field))
        : setQuery(activateField(query, field)),
    [active, field, query, setQuery],
  );
  if (!optFields.includes(field) || field === "title")
    return <SmallButtonOpt />;
  return (
    <SmallButtonOpt
      active={active}
      toggle={toggle}
      borderStyle="all"
      borderWidth={1}
      my={2}
      display="flex"
      flexDirection="row"
      alignItems="center"
    >
      {active && <LuCheck size={14} />}
    </SmallButtonOpt>
  );
}
*/

function SortSelectorField(sort: ISort) {
  const field = useMainStore.get(oField);
  const asc = useMainStore.get(oAsc);
  const active = field == sort.field && asc == sort.asc;
  const navigate = useMainStore.setValue(oSort, sort);
  return (
    <SmallButtonOpt active={active} navigate={navigate}>
      {sort.asc ? <LuChevronUp /> : <LuChevronDown />}
    </SmallButtonOpt>
  );
}

function QuerySelectorRow({ field }: { field: OrderField }) {
  return (
    <Box display="flex" flexDirection="row" gap={5}>
      {/* <QueryCheckBox field={field} /> */}
      <Box width="fieldWidth">{field}</Box>
      <Box display="flex" flexDirection="row" gap={2}>
        <SortSelectorField field={field} asc={true} />
        <SortSelectorField field={field} asc={false} />
      </Box>
      <Box display="flex" flexDirection="row" gap={2}>
        {/* <Bound field={field} start={true} /> */}
        {/* <Bound field={field} start={false} /> */}
      </Box>
    </Box>
  );
}

function QuerySelector({}: {}) {
  const {
    restrict: { event, due, since, until },
  } = useResults();
  return (
    <Box
      p={10}
      borderRadius={5}
      borderWidth={1}
      borderStyle="all"
      display="flex"
      flexDirection="column"
      gap={2}
      alignItems="center"
    >
      <QuerySelectorRow field="title" />
      <QuerySelectorRow field="wordcount" />
      <QuerySelectorRow field="mtime" />
      {event && <QuerySelectorRow field="event" />}
      {due && <QuerySelectorRow field="due" />}
      {since && <QuerySelectorRow field="since" />}
      {until && <QuerySelectorRow field="until" />}
    </Box>
  );
}

function Dir({ dir }: { dir: string }) {
  const [current, navigate] = useMainStore.lensValue(oDir, dir);
  const active = current === dir;
  if (dir === "") return <Clear active={active} navigate={navigate} />;
  return (
    <RoundedButtonOpt
      active={active}
      navigate={navigate}
      fontFamily="monospace"
    >
      {dir}
    </RoundedButtonOpt>
  );
}

function Tag({ tag }: { tag: string }) {
  const oTag = useMemo(() => getOTag(tag), [tag]);
  const [active, toggle] = useMainStore.lensModify(oTag, neg);
  return (
    <RoundedButtonOpt active={active} toggle={toggle}>
      {tag}
    </RoundedButtonOpt>
  );
}

function Dirs({}: {}) {
  const {
    restrict: { ids },
  } = useResults();
  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="baseline"
      flexWrap="wrap"
      gap={5}
    >
      <Label>Dirs</Label>
      {ids.map((id) => (
        <Dir key={id} dir={id} />
      ))}
    </Box>
  );
}

function ClearTags({}: {}) {
  const [current, navigate] = useMainStore.lensValue(oTags, []);
  const active = current.length === 0;
  return <Clear active={active} navigate={navigate} />;
}

function Views({}: {}) {
  return (
    <Box display="flex" flexDirection="column" gap={5}>
      <NoteViews />
      <KanbanViews />
    </Box>
  );
}

function KanbanView({ kanban }: { kanban: string }) {
  const target = useMemo(
    () => ({
      type: "kanban" as const,
      kanban,
    }),
    [kanban],
  );
  const [current, navigate] = useMainStore.lensValue(oView, target);
  const active = current.type === "kanban" && current.kanban === kanban;
  return (
    <ButtonOpt active={active} navigate={navigate}>
      {kanban}
    </ButtonOpt>
  );
}

function KanbanViews({}: {}) {
  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="baseline"
      flexWrap="wrap"
      gap={5}
    >
      <Label>Kanban</Label>
      <KanbanView kanban="todo" />
    </Box>
  );
}

const notesViewTarget = { type: "notes" as const };
function NoteViews({}: {}) {
  const [current, navigate] = useMainStore.lensValue(oView, notesViewTarget);
  const active = current.type === "notes";
  return (
    <ButtonOpt
      active={active}
      navigate={navigate}
      display="flex"
      flexDirection="row"
      alignItems="baseline"
      flexWrap="wrap"
      gap={5}
    >
      <Label>Notes</Label>
    </ButtonOpt>
  );
}

function Tags({}: {}) {
  const {
    restrict: { tags },
  } = useResults();
  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="baseline"
      flexWrap="wrap"
      gap={5}
    >
      <Label>Tags</Label>
      <ClearTags />
      {tags.map((tag) => (
        <Tag key={tag} tag={tag} />
      ))}
    </Box>
  );
}

function ClearAll({}: {}) {
  const [current, navigate] = useMainStore.lensValue(oQuery, nullQuery);
  // TODO: deep equal compare (cuurent, nullQuery)
  const active = false;
  return (
    <ButtonOpt active={active} navigate={navigate}>
      Reset
    </ButtonOpt>
  );
}

function HiddenButton({ children }: { children: ReactNode }) {
  const { restrict } = useResults();
  const [active, toggle] = useMainStore.lensModify(oHidden, neg);
  if (restrict.hidden)
    return (
      <ButtonOpt active={active} toggle={toggle}>
        {children}
      </ButtonOpt>
    );
  return <Box>{children}</Box>;
}

function Hidden({}: {}) {
  const {
    restrict: { hidden },
  } = useResults();
  return <HiddenButton>{`${hidden} hidden`}</HiddenButton>;
}

export function Notes({}: {}) {
  const { notes } = useResults();
  return (
    <Box
      mx={5}
      my={10}
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Box
        display="flex"
        flexDirection="column"
        gap={10}
        width="100%"
        maxWidth="screenMaxWidth"
        alignItems="stretch"
      >
        <Box
          display="flex"
          flexDirection="row"
          gap={5}
          justifyContent="space-between"
        >
          <Box display="flex" flexDirection="column" gap={5}>
            <Views />
            <Dirs />
            <Tags />
            <ClearAll />
          </Box>
          <QuerySelector />
        </Box>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="flex-end"
          borderWidth={1}
          borderStyle="bottom"
          gap={5}
        >
          <Box>{notes.length} entries,</Box>
          <Hidden />
        </Box>
        <Box display="flex" flexDirection="column">
          {notes.map((note) => (
            <Entry key={note.id} note={note} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
