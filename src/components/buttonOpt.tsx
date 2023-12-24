import { ReactNode } from "react";
import { Box, BoxProps } from "./box";

export type ButtonOptProps = {
  children?: ReactNode;
  active?: boolean;
  toggle?: () => void;
  activate?: () => void;
  deActivate?: () => void;
} & Omit<BoxProps, "as" | "onClick">;

export function ButtonOpt({
  children,
  active,
  toggle,
  activate,
  deActivate,
  ...props
}: ButtonOptProps) {
  const onClick = toggle ? toggle : active ? deActivate : activate;
  return (
    <Box
      as={onClick ? "button" : undefined}
      onClick={onClick}
      color={active ? "active" : undefined}
      {...props}
    >
      {children}
    </Box>
  );
}
