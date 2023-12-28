import { ReactNode } from "react";
import { Box, BoxProps } from "./box";
import clsx from "clsx";
import { sprinkles } from "@/sprinkles.css";

interface Toggle {
  toggle: () => void;
}

interface Navigate {
  navigate: () => void;
}

interface PlaceHolder {}

type Click = Toggle | Navigate | PlaceHolder;

export type ButtonOptProps = {
  children?: ReactNode;
  active?: boolean;
} & Click &
  Omit<BoxProps, "as" | "onClick">;

export function ButtonOpt({ children, active, ...params }: ButtonOptProps) {
  let onClick: (() => void) | undefined;
  let props: BoxProps;
  if ("toggle" in params) {
    const { toggle, ...props_ } = params;
    onClick = toggle;
    props = props_;
  } else if ("navigate" in params) {
    const { navigate, ...props_ } = params;
    onClick = active ? undefined : navigate;
    props = props_;
  } else {
    onClick = undefined;
    props = params;
  }
  return (
    <Box
      as={onClick ? "button" : undefined}
      onClick={onClick}
      className={clsx({ [sprinkles({ color: "active" })]: active })}
      {...props}
    >
      {children}
    </Box>
  );
}
