"use client";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { CaretUpIcon, CaretDownIcon, CheckIcon } from "@radix-ui/react-icons";
import {
  useQuery,
  destringifySort,
  stringifySort,
} from "@/app/components/notes";
import { Box, BoxProps } from "@/components/box";
import { INote, isStringField, optFields } from "@/core/note";
import { Link } from "@/components/link";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { OrderField, orderFields } from "@/core/sorters";
import { selector } from "./entries.css";
import { H1 } from "@/components/h1";
import { getBound, isValidBound, setBound, setFilter } from "@/core";

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
  const [_, query, setQuery] = useQuery();
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
  const [_, query, setQuery] = useQuery();
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
  const [_, query, setQuery] = useQuery();
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
        <QuerySelectorRow field="event" />
        <QuerySelectorRow field="due" />
        <QuerySelectorRow field="since" />
        <QuerySelectorRow field="until" />
      </Box>
    </SortSelector>
  );
}

export function Notes({}: {}) {
  const [notes, query] = useQuery();
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
          </Box>
          <QuerySelector />
        </Box>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="flex-end"
          borderWidth={1}
          borderStyle="bottom"
        >
          <Box>{notes.length} entries</Box>
        </Box>
        <Box display="flex" flexDirection="column">
          {notes.map((note) => (
            <Entry key={note.id} note={note} />
          ))}
        </Box>
      </Box>
      <Box>{JSON.stringify(query)}</Box>
    </Box>
  );
}
