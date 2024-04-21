"use client";

import { Box } from "@/components/box";
import { INote } from "@/core/note";
import { ButtonOpt } from "@/components/buttonOpt";
import { useMainStore } from "@/components/store";
import {
  oHidden,
  oSorted,
  oHiddenCount,
  oFilteredCount,
  oFocused,
} from "@/utils/optics";
import { neg } from "@/utils/functions";

function Entry({ note }: { note: INote }) {
  const [active, activate] = useMainStore.lensActivate(oFocused, note.id);
  return (
    <ButtonOpt
      active={active}
      navigate={activate}
      fontFamily={note.title ? undefined : "monospace"}
    >
      {note.title || note.id}
    </ButtonOpt>
  );
}

function HiddenButton({}: {}) {
  const [active, toggle] = useMainStore.lensModify(oHidden, neg);
  const hidden = useMainStore.get(oHiddenCount);
  const text = `${hidden} hidden`;
  if (hidden)
    return (
      <ButtonOpt active={active} toggle={toggle}>
        {text}
      </ButtonOpt>
    );
  return <Box>{text}</Box>;
}

function Count({}: {}) {
  const filtered = useMainStore.getter(oFilteredCount);
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
      <HiddenButton />
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
      display="flex"
      flexDirection="column"
      gap={10}
      width="100%"
      maxWidth="screenMaxWidth"
      alignItems="stretch"
    >
      <Count />
      <Entries />
    </Box>
  );
}
