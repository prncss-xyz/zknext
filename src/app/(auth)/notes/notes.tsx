"use client";

import { LuChevronUp, LuChevronDown, LuCheck } from "react-icons/lu";
import { useQuery } from "./query";
import { Box } from "@/components/box";
import { INote, isStringField, optFields } from "@/core/note";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { OrderField } from "@/core/sorters";
import {
  isActiveField,
  getBound,
  isValidBound,
  nullQuery,
  setBound,
  activateField,
  deActivateField,
} from "@/core";
import { toggle } from "@/utils/arrays";
import { deepEqual } from "fast-equals";
import { useNoteOverlay } from "./noteOverlay";
import { Clear } from "@/components/clear";
import { RoundedButtonOpt } from "@/components/roundedButtonOpt";
import { Label } from "@/components/label";
import { SmallButtonOpt } from "@/components/smallButtonOpt";
import { ButtonOpt } from "@/components/buttonOpt";

function Entry({ note }: { note: INote }) {
  const [id, setId] = useNoteOverlay();
  const active = id === note.id;
  const activate = useCallback(() => setId(note.id), [note.id, setId]);
  return (
    <ButtonOpt
      active={active}
      activate={activate}
      fontFamily={note.title ? undefined : "monospace"}
    >
      {note.title ?? note.id}
    </ButtonOpt>
  );
}

function Bound({ field, start }: { field: OrderField; start: boolean }) {
  const { query, setQuery } = useQuery();
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

function QueryCheckBox({ field }: { field: OrderField }) {
  const { query, setQuery } = useQuery();
  const active = isActiveField(query, field);
  const activate = useCallback(
    () => setQuery(activateField(query, field)),
    [field, query, setQuery],
  );
  const deActivate = useCallback(
    () => setQuery(deActivateField(query, field)),
    [field, query, setQuery],
  );
  if (!optFields.includes(field) || field === "title")
    return <SmallButtonOpt />;
  return (
    <SmallButtonOpt
      active={active}
      activate={activate}
      deActivate={deActivate}
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

function SortSelectorField({
  field,
  asc,
}: {
  field: OrderField;
  asc: boolean;
}) {
  const { query, setQuery } = useQuery();
  const { sort } = query;
  const active = deepEqual(sort, { field, asc });
  const activate = useCallback(
    () => setQuery({ ...query, sort: { field, asc } }),
    [asc, field, query, setQuery],
  );
  return (
    <SmallButtonOpt active={active} activate={activate}>
      {asc ? <LuChevronUp /> : <LuChevronDown />}
    </SmallButtonOpt>
  );
}

function QuerySelectorRow({ field }: { field: OrderField }) {
  return (
    <Box display="flex" flexDirection="row" gap={5}>
      <QueryCheckBox field={field} />
      <Box width="fieldWidth">{field}</Box>
      <Box display="flex" flexDirection="row" gap={2}>
        <SortSelectorField field={field} asc={true} />
        <SortSelectorField field={field} asc={false} />
      </Box>
      <Box display="flex" flexDirection="row" gap={2}>
        <Bound field={field} start={true} />
        <Bound field={field} start={false} />
      </Box>
    </Box>
  );
}

function QuerySelector({}: {}) {
  const {
    restrict: { event, due, since, until },
  } = useQuery();
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
  const { query, setQuery } = useQuery();
  const { filter } = query;
  const { id: current } = filter;
  const active = dir === current;
  const activate = useCallback(() => {
    setQuery({ ...query, filter: { ...filter, id: dir } });
  }, [filter, dir, query, setQuery]);
  if (dir === "") return <Clear active={active} activate={activate} />;
  return (
    <RoundedButtonOpt
      active={active}
      activate={activate}
      fontFamily="monospace"
    >
      {dir}
    </RoundedButtonOpt>
  );
}

function Tag({ tag }: { tag: string }) {
  const { query, setQuery } = useQuery();
  const { filter } = query;
  const { tags } = filter;
  const active = tags.includes(tag);
  const handler = useCallback(() => {
    setQuery({
      ...query,
      filter: { ...filter, tags: toggle(tags, tag, !active) },
    });
  }, [active, filter, query, setQuery, tag, tags]);
  return (
    <RoundedButtonOpt active={active} toggle={handler}>
      {tag}
    </RoundedButtonOpt>
  );
}

function Dirs({}: {}) {
  const {
    restrict: { ids },
  } = useQuery();
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
  const { query, setQuery } = useQuery();
  const { filter } = query;
  const clear = useCallback(() => {
    setQuery({
      ...query,
      filter: { ...filter, tags: [] },
    });
  }, [filter, query, setQuery]);
  const active = deepEqual(filter.tags, []);
  return <Clear active={active} activate={clear} />;
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
  const { query, setQuery } = useQuery();
  const activate = useCallback(() => {
    setQuery({
      ...query,
      filter: { ...query.filter, view: { type: "kanban", kanban } },
    });
  }, [kanban, query, setQuery]);
  return (
    <Box as="button" onClick={activate}>
      {kanban}
    </Box>
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

function NoteViews({}: {}) {
  const { query, setQuery } = useQuery();
  const active = query.filter.view.type === "notes";
  const activate = useCallback(() => {
    setQuery({
      ...query,
      filter: { ...query.filter, view: { type: "notes" } },
    });
  }, [query, setQuery]);
  return (
    <ButtonOpt
      active={active}
      activate={activate}
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
  } = useQuery();
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
  const { query, setQuery } = useQuery();
  const active = deepEqual(query, nullQuery);
  const clear = useCallback(() => {
    setQuery(nullQuery);
  }, [setQuery]);
  return (
    <ButtonOpt active={active} activate={clear}>
      Reset
    </ButtonOpt>
  );
}

function HiddenButton({ children }: { children: ReactNode }) {
  const {
    query,
    setQuery,
    restrict: { hidden },
  } = useQuery();
  const { filter } = query;
  const active = filter.hidden;
  const toggle = useCallback(() => {
    setQuery({ ...query, filter: { ...filter, hidden: !active } });
  }, [active, filter, query, setQuery]);
  if (hidden) return <ButtonOpt toggle={toggle}>{children}</ButtonOpt>;
  return <Box>{children}</Box>;
}

function Hidden({}: {}) {
  const {
    restrict: { hidden },
  } = useQuery();
  return <HiddenButton>{`${hidden} hidden`}</HiddenButton>;
}

export function Notes({}: {}) {
  const { query, notes } = useQuery();
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
        {JSON.stringify(query)}
        {JSON.stringify(isActiveField(query, "due"))}
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
