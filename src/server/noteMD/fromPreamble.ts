import { toArray } from "@/utils/parse";
import { z } from "zod";

const dataSchema = z.object({
  tags: z.preprocess(toArray, z.array(z.string())),
});

export function fromPreamble(preamble: unknown) {
  return dataSchema.parse(preamble);
}
