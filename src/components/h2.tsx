import { ReactNode } from "react";
import { Box, BoxProps } from "./box";

export function H2({ children, ...props }: { children: ReactNode } & BoxProps) {
  return (
    <Box mb={10} fontWeight="bold" {...props}>
      {children}
    </Box>
  );
}
