import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box } from "./box";
import { H1 } from "./h1";
import * as O from "optics-ts";
import { useLens, useSet } from "./optics";

function decode(str: string): number | undefined {
  if (str === "") return undefined;
  const num = Number(str);
  if (isNaN(num)) return undefined;
  return num;
}

function encode(num: number | undefined): string {
  return num === undefined ? "" : String(num);
}

type D = number | undefined;

const numStr = O.optic<string>().iso(decode, encode);
const strNum = O.optic<D>().iso(encode, decode);

type State<S> = [s: S, setS: (s: S) => void];

function useSyncState<S>([s, setS]: State<S>, [t, setT]: State<S>) {
  useEffect(() => setS(t), [setS, t]);
  /* useEffect(() => setT(s), [s, setT]); */
}

function useInputRef<S, T extends O.OpticParams>(
  encodec: O.Iso<S, T, string>,
  [state, setState]: State<S>,
) {
  /* const init = O.set(encodec)(state)("") as unknown as string; */
  const init = O.get(encodec)(state);
  const [encoded, setEncoded] = useLens(encodec, [state, setState]);
  const ref = useRef<HTMLInputElement>();
  const onChange = useCallback(() => {
    if (ref.current === undefined) return;
    const encoded_ = ref.current.value;
    setEncoded(encoded_);
  }, [setEncoded]);
  /* useSyncState([state, setState], [decoded, setDecoded]); */
  useEffect(() => {
    if (ref.current === undefined) return;
    if (encoded === O.get(encodec)(state)) return;
    ref.current.value = encoded;
  }, [encodec, encoded, state]);
  const error = ref.current?.value !== "" && state === undefined;
  return { init, error, onChange, ref };
}

function useInput<S, T extends O.OpticParams>(
  encodec: O.Iso<string, T, S>,
  [state, setState]: State<S>,
) {
  const init = O.set(encodec)(state)("") as unknown as string;
  const [encoded, setEncoded] = useState(init);
  const [decoded, setDecoded] = useLens(encodec, [encoded, setEncoded]);
  const onChange = useCallback(
    (e: any) => {
      const encoded_ = e.target.value as string;
      setEncoded(encoded_);
    },
    [setEncoded],
  );
  useSyncState([state, setState], [decoded, setDecoded]);
  const error = encoded !== "" && decoded === undefined;
  return { error, onChange, encoded };
}

export function InputTest({}: {}) {
  const [value, setValue] = useState<D>(3);
  /* const { error, onChange, encoded } = useInput(numStr, [value, setValue]); */
  const { error, onChange, ref, init } = useInputRef(strNum, [value, setValue]);
  return (
    <Box display="flex" flexDirection="column" gap={5}>
      <H1>Test</H1>
      <Box>value: {JSON.stringify(value) ?? "undefined"}</Box>
      {/* <Box>encoded: {JSON.stringify(encoded) ?? "undefined"}</Box> */}
      <Box
        ref={ref}
        as="input"
        borderStyle="all"
        borderColor={error ? "error" : undefined}
        backgroundColor="foreground1"
        defaultValue={init}
        /* value={encoded} */
        onChange={onChange}
      />
    </Box>
  );
}
