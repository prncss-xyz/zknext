"use client";

import { LuChevronUp, LuChevronDown, LuCheck } from "react-icons/lu";
import { Box } from "@/components/box";
import { NumberField, optFields } from "@/core/note";
import { useCallback, useMemo } from "react";
import { OrderField } from "@/core/sorters";
import { nullQuery } from "@/core";
import { Clear } from "@/components/clear";
import { RoundedButtonOpt } from "@/components/roundedButtonOpt";
import { Label } from "@/components/label";
import { SmallButtonOpt } from "@/components/smallButtonOpt";
import { ButtonOpt } from "@/components/buttonOpt";
import { useMainStore } from "@/components/store";
import {
  oDir,
  getOTag,
  oQuery,
  oIds,
  oRestrictKanbans,
  oRestrictTags,
  oSort,
  oView,
  oTags,
  getOFilterRangeBound,
  getOFilterActive,
  getOSelectField,
} from "@/utils/optics";
import { RangeField } from "@/core/filters";
import { Input } from "@/components/input";
import { dateString, numberString } from "@/utils/encodec";

function BoundNumber({ field, start }: { field: NumberField; start: boolean }) {
  const o = useMemo(() => getOFilterRangeBound(field, start), [field, start]);
  const [value, setValue] = useMainStore.rw(o);
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
  field: NumberField | RangeField;
  start: boolean;
}) {
  const o = useMemo(() => getOFilterRangeBound(field, start), [field, start]);
  const [value, setValue] = useMainStore.rw(o);
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
  const [active, setActive] = useMainStore.rw(o);
  const toggle = useCallback(() => setActive((v) => !v), [setActive]);
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
  const [active, navigate] = useMainStore.activate(oSort, { asc, field });
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

function QuerySelectorNumberRow({ field }: { field: NumberField }) {
  return (
    <Box display="flex" flexDirection="row" gap={5}>
      <QueryCheckBox field={field} />
      <Box width="fieldWidth">{field}</Box>
      <Box display="flex" flexDirection="row" gap={2}>
        <SortSelectorField field={field} asc={true} />
        <SortSelectorField field={field} asc={false} />
      </Box>
      <Box display="flex" flexDirection="row" gap={2} color="muted">
        <BoundNumber field={field} start={true} />
        <BoundNumber field={field} start={false} />
      </Box>
    </Box>
  );
}

function QuerySelectorDateRow({ field }: { field: RangeField | NumberField }) {
  return (
    <Box display="flex" flexDirection="row" gap={5}>
      <QueryCheckBox field={field} />
      <Box width="fieldWidth">{field}</Box>
      <Box display="flex" flexDirection="row" gap={2}>
        <SortSelectorField field={field} asc={true} />
        <SortSelectorField field={field} asc={false} />
      </Box>
      <Box display="flex" flexDirection="row" gap={2} color="muted">
        <BoundDate field={field} start={true} />
        <BoundDate field={field} start={false} />
      </Box>
    </Box>
  );
}

function QuerySelectorOptDateRow({
  field,
}: {
  field: "event" | "since" | "until" | "due";
}) {
  const active = useMainStore.get(
    useMemo(() => getOSelectField(field), [field]),
  );
  return active && <QuerySelectorDateRow field={field} />;
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
      <QuerySelectorNumberRow field="wordcount" />
      <QuerySelectorDateRow field="mtime" />
      <QuerySelectorOptDateRow field="event" />
      <QuerySelectorOptDateRow field="due" />
      <QuerySelectorOptDateRow field="since" />
      <QuerySelectorOptDateRow field="until" />
    </Box>
  );
}

function Dir({ dir }: { dir: string }) {
  const [active, navigate] = useMainStore.activate(oDir, dir);
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
  const [active, setActive] = useMainStore.rw(oTag);
  const toggle = useCallback(() => setActive((v) => !v), [setActive]);
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
  const [active, navigate] = useMainStore.activate(oTags, []);
  return <Clear active={active} navigate={navigate} />;
}

function Views({}: {}) {
  return (
    <Box display="flex" flexDirection="column" gap={5}>
      <NoteViews />
      {/* <KanbanViews /> */}
    </Box>
  );
}

function KanbanView({ kanban }: { kanban: string }) {
  const [active, navigate] = useMainStore.activate(oView, {
    type: "kanban",
    kanban,
  });
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

function NoteViews({}: {}) {
  const [active, navigate] = useMainStore.activate(oView, {
    type: "notes",
  });
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
  const tags = useMainStore.get(oRestrictTags);
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
  const [active, navigate] = useMainStore.activate(oQuery, nullQuery);
  return (
    <ButtonOpt active={active} navigate={navigate}>
      Reset
    </ButtonOpt>
  );
}

export function Navigator({}: {}) {
  return (
    <Box
      width="100%"
      maxWidth="screenMaxWidth"
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
  );
}
