import { toArray } from "./parse";

describe("toArray", () => {
  it("should convert undefined to empty array", () => {
    expect(toArray(undefined)).toEqual([]);
  });
  it("should convert simple value to array", () => {
    expect(toArray(1)).toEqual([1]);
  });
  it("should keep array untouched", () => {
    expect(toArray([1])).toEqual([1]);
  });
});
