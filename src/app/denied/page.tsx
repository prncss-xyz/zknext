import { Box } from "@/components/box";
import { H1 } from "@/components/h1";

export default function Page() {
  return (
    <Box width="screenMaxWidth">
      <H1>Access denied</H1>
      <Box>App can only be accessed from localhost.</Box>
    </Box>
  );
}
