import { useCallback, useState, useEffect } from "react";
import { Box, BoxProps } from "./box";
import { IEncodec } from "@/core/encodec";

export type InputProps<A> = {
  encodec: IEncodec<A>;
  value: A;
  setValue: (v: A) => void;
} & Omit<BoxProps, "as" | "onClick">;

type IState<S> = [state: S, setState: (s: S) => void];

function useInput<A>(
  { encode, decode }: IEncodec<A>,
  [value, setValue]: IState<A>,
) {
  const [encoded, setEncoded] = useState(encode(value));
  useEffect(() => {
    setEncoded(encode(value));
  }, [encode, value]);
  const decoded = decode(encoded);
  const onChange = useCallback((e: any) => {
    const value_ = String(e.target.value);
    setEncoded(value_);
  }, []);
  const onBlur = useCallback(() => {
    if (decoded === undefined) return;
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
  const error = encoded && decoded === undefined;
  return { encoded, onChange, onBlur, onKeyDown, error };
}

export function Input<A>({
  encodec,
  value,
  setValue,
  ...props
}: InputProps<A>) {
  const { encoded, onChange, onBlur, onKeyDown, error } = useInput(encodec, [
    value,
    setValue,
  ]);
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
