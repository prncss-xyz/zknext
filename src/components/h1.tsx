import { ReactNode } from "react";
import { Box, BoxProps } from "./box";

export function H1({ children, ...props }: { children: ReactNode } & BoxProps) {
  return (
    <Box as="h1" fontWeight="bold" {...props}>
      {children}
    </Box>
  );
}
