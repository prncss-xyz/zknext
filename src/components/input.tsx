import { useCallback, useState, useEffect } from "react";
import { Box, BoxProps } from "./box";
import { Errable } from "@/utils/errable";

export type InputProps<A> = {
  encode: (v: A) => string;
  decode: (e: string) => Errable<A>;
  value: A;
  setValue: (v: A) => void;
} & Omit<BoxProps, "as" | "onClick">;

export function Input<A>({
  encode,
  decode,
  value,
  setValue,
  ...props
}: InputProps<A>) {
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
    if (decoded._tag === "failure") return;
    setValue(decoded.result);
    // @ts-expect-error
  }, [decoded._tag, decoded.result, setValue]);
  const onKeyDown = useCallback(
    (event: any) => {
      const key: string = event.key;
      if (key !== "Enter") return;
      if (decoded._tag === "failure") return;
      setValue(decoded.result);
    },
    // @ts-expect-error
    [decoded._tag, decoded.result, setValue],
  );
  return (
    <Box
      as="input"
      value={encoded}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      color={decoded._tag === "failure" ? "error" : undefined}
      {...props}
    />
  );
}
