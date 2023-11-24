import { ReactNode } from "react";
import { Box } from "./box";

export function H1({children}: {children: ReactNode}) {
  return <Box as="h1" mb={10} fontWeight="bold">{children}</Box>;
}
