import * as O from "optics-ts";
import { getOFilterRangeBound } from "./optics";
import { nullMainStore } from "@/components/store";
import { nullQuery } from "@/core";
import { nullFilter } from "@/core/filters";

describe("optics", () => {
  describe("getOFilterRangeBound", () => {
    it("should preview bound value", () => {
      const o = getOFilterRangeBound("wordcount", true);
      expect(
        O.get(o)({
          ...nullMainStore,
          query: {
            ...nullQuery,
            filter: { ...nullFilter, wordcount: { start: 3 } },
          },
        }),
      ).toBe(3);
    });
    it("should update bound value", () => {
      const o = getOFilterRangeBound("wordcount", true);
      expect(
        O.set(o)(3)({
          ...nullMainStore,
          query: {
            ...nullQuery,
            filter: { ...nullFilter, wordcount: { end: 1 } },
          },
        }),
      ).toEqual({
        ...nullMainStore,
        query: {
          ...nullQuery,
          filter: { ...nullFilter, wordcount: { start: 3 } },
        },
      });
    });
  });
});
