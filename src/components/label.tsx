import { ReactNode } from "react";
import { BoxProps, Box } from "./box";

export function Label({
  children,
  ...props
}: { children: ReactNode } & BoxProps) {
  return (
    <Box fontWeight="bold" {...props}>
      {children}
    </Box>
  );
}
