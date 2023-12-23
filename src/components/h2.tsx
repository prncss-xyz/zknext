import { ReactNode } from "react";
import { Box } from "./box";

export function H2({children}: {children: ReactNode}) {
  return <Box mb={10} fontWeight="bold">{children}</Box>;
}
