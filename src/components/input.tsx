import { useCallback, useState, useEffect, useMemo } from "react";
import { Box, BoxProps } from "./box";
import { Encodec } from "@/utils/encodec";

type InputProps<A> = {
  encodec: Encodec<A>;
  value: A | undefined;
  setValue: (v: A | undefined) => void;
} & Omit<BoxProps, "as" | "onClick" | "value">;

function useInput<A>(
  { encode, decode }: Encodec<A>,
  value: A | undefined,
  setValue: (s: A | undefined) => void,
) {
  const [encoded, setEncoded] = useState(encode(value));
  useEffect(() => {
    setEncoded(encode(value));
  }, [encode, value]);
  const decoded = useMemo(() => decode(encoded), [decode, encoded]);
  const onChange = useCallback((e: any) => {
    const value_ = String(e.target.value);
    setEncoded(value_);
  }, []);
  const onBlur = useCallback(() => {
    setValue(decoded);
  }, [decoded, setValue]);
  const onKeyDown = useCallback(
    (event: any) => {
      const key: string = event.key;
      if (key !== "Enter") return;
      if (decoded === undefined) return;
      setValue(decoded);
    },
    [decoded, setValue],
  );
  const error = Boolean(encoded) && decoded === undefined;
  return { encoded, onChange, onBlur, onKeyDown, error };
}

export function Input<A>({
  encodec,
  value,
  setValue,
  ...props
}: InputProps<A>) {
  const { encoded, onChange, onBlur, onKeyDown, error } = useInput(
    encodec,
    value,
    setValue,
  );
  return (
    <Box
      as="input"
      value={encoded}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      color={error ? "error" : undefined}
      {...props}
    />
  );
}
