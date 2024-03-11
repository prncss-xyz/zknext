"use client";

import { LuChevronUp, LuChevronDown, LuCheck } from "react-icons/lu";
import { Box } from "@/components/box";
import {
  DateField,
  DateRangeField,
  INote,
  NumberField,
  isNumberField,
  optFields,
} from "@/core/note";
import { ReactNode, useMemo } from "react";
import { OrderField } from "@/core/sorters";
import { nullQuery } from "@/core";
import { Clear } from "@/components/clear";
import { RoundedButtonOpt } from "@/components/roundedButtonOpt";
import { Label } from "@/components/label";
import { SmallButtonOpt } from "@/components/smallButtonOpt";
import { ButtonOpt } from "@/components/buttonOpt";
import { oState, useMainStore } from "@/components/store";
import {
  oDir,
  getOTag,
  oTags,
  oView,
  oQuery,
  oHidden,
  neg,
  oIds,
  oSorted,
  oHiddenCount,
  getOFilterActive,
  getOFilterNumberBound,
  getOFilterDateBound,
  oFilteredCount,
  getORestictField,
  oRestrictKanbans,
  getOSelectorField,
} from "@/utils/optics";
import { RangeField } from "@/core/filters";
import { Input } from "@/components/input";
import { dateString, numberString } from "@/utils/encodec";

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

function BoundNumber({ field, start }: { field: NumberField; start: boolean }) {
  const o = useMemo(() => getOFilterNumberBound(field, start), [field, start]);
  const [value, setValue] = useMainStore.lens(o);
  return (
    <Input
      width="navInputWidth"
      textAlign="center"
      backgroundColor="foreground2"
      borderRadius={2}
      px={2}
      encodec={numberString}
      value={value}
      setValue={setValue}
    />
  );
}

function BoundDate({
  field,
  start,
}: {
  field: DateField | DateRangeField;
  start: boolean;
}) {
  const o = useMemo(() => getOFilterDateBound(field, start), [field, start]);
  const [value, setValue] = useMainStore.lens(o);
  return (
    <Input
      width="navInputWidth"
      textAlign="center"
      backgroundColor="foreground2"
      borderRadius={2}
      px={2}
      encodec={dateString}
      value={value}
      setValue={setValue}
    />
  );
}

function QueryCheckBox({ field }: { field: RangeField }) {
  const o = useMemo(() => getOFilterActive(field), [field]);
  const [active, toggle] = useMainStore.lensModify(o, neg);
  if (!optFields.includes(field)) return <SmallButtonOpt />;
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

function SortSelectorField({
  field,
  asc,
}: {
  field: OrderField;
  asc: boolean;
}) {
  const o = useMemo(() => getOSelectorField(field, asc), [asc, field]);
  const [active, navigate] = useMainStore.lensValue(o, true);
  return (
    <SmallButtonOpt active={active} navigate={navigate}>
      {asc ? <LuChevronUp /> : <LuChevronDown />}
    </SmallButtonOpt>
  );
}

function OrderSelectorRow({ field }: { field: OrderField }) {
  return (
    <Box display="flex" flexDirection="row" gap={5}>
      <SmallButtonOpt />
      <Box width="fieldWidth">{field}</Box>
      <Box display="flex" flexDirection="row" gap={2}>
        <SortSelectorField field={field} asc={true} />
        <SortSelectorField field={field} asc={false} />
      </Box>
      <Box display="flex" flexDirection="row" gap={2} color="muted">
        <Box width="navInputWidth" px={2} />
        <Box width="navInputWidth" px={2} />
      </Box>
    </Box>
  );
}

function QuerySelectorRow({ field }: { field: RangeField }) {
  return (
    <Box display="flex" flexDirection="row" gap={5}>
      <QueryCheckBox field={field} />
      <Box width="fieldWidth">{field}</Box>
      <Box display="flex" flexDirection="row" gap={2}>
        <SortSelectorField field={field} asc={true} />
        <SortSelectorField field={field} asc={false} />
      </Box>
      <Box display="flex" flexDirection="row" gap={2} color="muted">
        {isNumberField(field) ? (
          <>
            <BoundNumber field={field} start={true} />
            <BoundNumber field={field} start={false} />
          </>
        ) : (
          (field === "mtime" || field === field) && (
            <>
              <BoundDate field={field} start={true} />
              <BoundDate field={field} start={false} />
            </>
          )
        )}
      </Box>
    </Box>
  );
}

function QuerySelectorOptRow({
  field,
}: {
  field: "event" | "since" | "until" | "due";
}) {
  const o = useMemo(() => getORestictField(field), [field]);
  const enabled = useMainStore.get(o);
  return enabled && <QuerySelectorRow field={field} />;
}

function QuerySelector({}: {}) {
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
      <OrderSelectorRow field="title" />
      <QuerySelectorRow field="wordcount" />
      <QuerySelectorRow field="mtime" />
      <QuerySelectorOptRow field="event" />
      <QuerySelectorOptRow field="due" />
      <QuerySelectorOptRow field="since" />
      <QuerySelectorOptRow field="until" />
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
  const ids = useMainStore.get(oIds);
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
  const kanbans = useMainStore.get(oRestrictKanbans);
  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="baseline"
      flexWrap="wrap"
      gap={5}
    >
      <Label>Kanban</Label>
      {kanbans.map((kanban) => (
        <KanbanView key={kanban} kanban={kanban} />
      ))}
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
  const tags = useMainStore.get(oTags);
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
  const navigate = useMainStore.setValue(oQuery, nullQuery);
  return (
    <ButtonOpt active={false} navigate={navigate}>
      Reset
    </ButtonOpt>
  );
}

function HiddenButton({ children }: { children: ReactNode }) {
  const [active, toggle] = useMainStore.lensModify(oHidden, neg);
  if (active)
    return (
      <ButtonOpt active={active} toggle={toggle}>
        {children}
      </ButtonOpt>
    );
  return <Box>{children}</Box>;
}

function Count({}: {}) {
  // seems to be a bug in optics-ts typing
  const filtered = useMainStore.get(oFilteredCount as any) as number;
  const hidden = useMainStore.get(oHiddenCount);
  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="flex-end"
      borderWidth={1}
      borderStyle="bottom"
      gap={5}
    >
      <Box>{filtered} entries,</Box>
      <HiddenButton>{`${hidden} hidden`}</HiddenButton>
    </Box>
  );
}

function Entries({}: {}) {
  const notes = useMainStore.get(oSorted);
  return (
    <Box display="flex" flexDirection="column">
      {notes.map((note) => (
        <Entry key={note.id} note={note} />
      ))}
    </Box>
  );
}

export function Notes({}: {}) {
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
        <Count />
        <Entries />
      </Box>
    </Box>
  );
}
