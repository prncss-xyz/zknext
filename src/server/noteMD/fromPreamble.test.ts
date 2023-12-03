import { fromPreamble } from "./fromPreamble";

describe("fromPreamble", () => {
  it("should parse empty object", () => {
    expect(typeof fromPreamble({})).toBe("object");
    expect(typeof fromPreamble({})).not.toBe("null");
  });
  describe("tags", () => {
    it("should default to empty array", () => {
      expect(fromPreamble({}).tags).toEqual([]);
    });
    it("should convert string to array", () => {
      expect(fromPreamble({ tags: "a" }).tags).toEqual(["a"]);
    });
    it("should keep array of strings", () => {
      expect(fromPreamble({ tags: ["a", "b"] }).tags).toEqual(["a", "b"]);
    });
    it("should reject non-strings", () => {
      expect(() => fromPreamble({ tags: 2 }).tags).toThrowError();
    });
  });
});
