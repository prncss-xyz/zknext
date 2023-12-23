"use client";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import {
  CaretUpIcon,
  CaretDownIcon,
  CheckIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import {
  useQuery,
  destringifySort,
  stringifySort,
} from "@/app/components/notes";
import { Box, BoxProps } from "@/components/box";
import { INote, isStringField, optFields } from "@/core/note";
import { Link } from "@/components/link";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { OrderField } from "@/core/sorters";
import { selector } from "./entries.css";
import { H1 } from "@/components/h1";
import { H2 } from "@/components/h2";
import { getBound, isValidBound, nullQuery, setBound, setFilter } from "@/core";
import { contains } from "@/utils/path";
import { toggle } from "@/utils/arrays";
import { deepEqual } from "fast-equals";

function Entry({ note }: { note: INote }) {
  return (
    <Link
      href={`/notes/${note.id}`}
      fontFamily={note.title ? undefined : "monospace"}
    >
      {note.title ?? note.id}
    </Link>
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

function SmallButtonPlaceholder({
  children,
  ...props
}: {
  children?: ReactNode;
} & BoxProps) {
  return (
    <Box
      width="navCheckboxWidth"
      height="navCheckboxWidth"
      display="flex"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      {...props}
    >
      {children}
    </Box>
  );
}

function SmallButton({
  children,
  ...props
}: {
  children?: ReactNode;
} & BoxProps) {
  return (
    <Box
      as="button"
      width="navCheckboxWidth"
      height="navCheckboxWidth"
      display="flex"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      {...props}
    >
      {children}
    </Box>
  );
}

function QueryCheckBox({ field }: { field: OrderField }) {
  const { query, setQuery } = useQuery();
  const checked = Boolean((query.filter as any)[field]);
  const setChecked = useCallback(
    (checked_: unknown) => {
      setQuery(setFilter(query, field, Boolean(checked_)));
    },
    [field, query, setQuery],
  );
  if (!optFields.includes(field) || field === "title")
    return <SmallButtonPlaceholder />;
  return (
    <Checkbox.Root
      checked={checked}
      onCheckedChange={setChecked as any}
      asChild
    >
      <SmallButton borderStyle="all" borderWidth={1} my={2}>
        <Checkbox.Indicator>
          <CheckIcon />
        </Checkbox.Indicator>
      </SmallButton>
    </Checkbox.Root>
  );
}

function SortSelector({ children }: { children: ReactNode }) {
  const { query, setQuery } = useQuery();
  const value = stringifySort(query.sort);
  const setValue = useCallback(
    (value_: string) => {
      const sort = destringifySort(value_);
      const { field } = sort;
      let v = (query.filter as any)[field];
      if (optFields.includes(field)) v ||= {};
      setQuery({ ...query, filter: { ...query.filter, [field]: v }, sort });
    },
    [query, setQuery],
  );
  return (
    <ToggleGroup.Root type="single" value={value} onValueChange={setValue}>
      {children}
    </ToggleGroup.Root>
  );
}

function SortSelectorField({
  field,
  asc,
}: {
  field: OrderField;
  asc: boolean;
}) {
  return (
    <ToggleGroup.Item
      value={stringifySort({
        field,
        asc,
      })}
      asChild
    >
      <SmallButton className={selector}>
        {asc ? <CaretUpIcon /> : <CaretDownIcon />}
      </SmallButton>
    </ToggleGroup.Item>
  );
}

const gridTemplateColumns = "auto auto auto auto";
function QuerySelectorRow({ field }: { field: OrderField }) {
  return (
    <>
      <QueryCheckBox field={field} />
      <Box>{field}</Box>
      <Box display="flex" flexDirection="row" gap={2}>
        <SortSelectorField field={field} asc={true} />
        <SortSelectorField field={field} asc={false} />
      </Box>
      <Box display="flex" flexDirection="row" gap={2}>
        <Bound field={field} start={true} />
        <Bound field={field} start={false} />
      </Box>
    </>
  );
}

function QuerySelector({}: {}) {
  const {
    restrict: { event, due, since, until },
  } = useQuery();
  return (
    <SortSelector>
      <Box
        p={10}
        borderRadius={5}
        borderWidth={1}
        borderStyle="all"
        display="grid"
        columnGap={10}
        rowGap={2}
        alignItems="center"
        style={{ gridTemplateColumns }}
      >
        <QuerySelectorRow field="title" />
        <QuerySelectorRow field="wordcount" />
        <QuerySelectorRow field="mtime" />
        {event && <QuerySelectorRow field="event" />}
        {due && <QuerySelectorRow field="due" />}
        {since && <QuerySelectorRow field="since" />}
        {until && <QuerySelectorRow field="until" />}
      </Box>
    </SortSelector>
  );
}

function DirBox({ dir, ...props }: { dir: string } & BoxProps) {
  return (
    <ButtonBox fontFamily="monospace" {...props}>
      {dir ? dir : <Cross2Icon />}
    </ButtonBox>
  );
}

function TagBox({ tag, ...props }: { tag: string } & BoxProps) {
  return <ButtonBox {...props}>{tag}</ButtonBox>;
}

function Dir({ dir }: { dir: string }) {
  const { query, setQuery } = useQuery();
  const { filter } = query;
  const { id: current } = filter;
  const active = contains(dir, current);
  const onClick = useCallback(() => {
    setQuery({ ...query, filter: { ...filter, id: dir } });
  }, [filter, dir, query, setQuery]);
  if (dir === current) return <DirBox dir={dir} />;
  return (
    <DirBox
      as="button"
      color={active ? "active" : undefined}
      dir={dir}
      onClick={onClick}
    />
  );
}

function Tag({ tag }: { tag: string }) {
  const { query, setQuery } = useQuery();
  const { filter } = query;
  const { tags: current } = filter;
  const active = current.includes(tag);
  const onClick = useCallback(() => {
    setQuery({
      ...query,
      filter: { ...filter, tags: toggle(current, tag, !active) },
    });
  }, [active, current, filter, query, setQuery, tag]);
  return (
    <TagBox
      as="button"
      color={active ? "active" : undefined}
      tag={tag}
      onClick={onClick}
    />
  );
}

function Dirs({}: {}) {
  const {
    restrict: { ids },
  } = useQuery();
  return (
    <Box>
      <H2>Dirs</H2>
      <Box display="flex" flexDirection="row" flexWrap="wrap" gap={5}>
        {ids.map((id) => (
          <Dir key={id} dir={id} />
        ))}
      </Box>
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
  return (
    <Box as="button" onClick={clear}>
      <Cross2Icon />
    </Box>
  );
}

function Tags({}: {}) {
  const {
    restrict: { tags },
  } = useQuery();
  return (
    <Box>
      <H2>Tags</H2>
      <Box display="flex" flexDirection="row" flexWrap="wrap" gap={5}>
        <ClearTags />
        {tags.map((tag) => (
          <Tag key={tag} tag={tag} />
        ))}
      </Box>
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
    <Box
      as="button"
      onClick={clear}
      color={active ? "active" : undefined}
    >
      Clear
    </Box>
  );
}

function ButtonBox({ children, ...props }: { children: ReactNode } & BoxProps) {
  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      borderRadius={2}
      backgroundColor="foreground2"
      px={5}
      py={2}
      {...props}
    >
      {children}
    </Box>
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
  const onClick = useCallback(() => {
    setQuery({ ...query, filter: { ...filter, hidden: !active } });
  }, [active, filter, query, setQuery]);
  if (hidden)
    return (
      <Box as="button" color={active ? "active" : undefined} onClick={onClick}>
        {children}
      </Box>
    );
  return <Box>{children}</Box>;
}

function Hidden({}: {}) {
  const {
    restrict: { hidden },
  } = useQuery();
  return <HiddenButton>{`${hidden} hidden`}</HiddenButton>;
}

export function Notes({}: {}) {
  const { notes, query, restrict } = useQuery();
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
          <Box display="flex" flexDirection="column">
            <H1>Notes</H1>
            <ClearAll />
            <Dirs />
            <Tags />
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
