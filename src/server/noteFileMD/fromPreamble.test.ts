import { nullNote } from "@/core/note";
import { fromPreamble } from "./fromPreamble";

describe("fromPreamble", () => {
  it("should parse empty object", () => {
    expect(typeof fromPreamble({})).toBe("object");
    expect(typeof fromPreamble({})).not.toBe("null");
  });
  it("should use proper defaults", () => {
    expect(nullNote).toMatchObject(fromPreamble({}));
  });
  describe("tags", () => {
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
  describe("due", () => {
    it("should parse properly", () => {
      expect(fromPreamble({ due: "2020-10-10" }).due).toEqual(
        new Date("2020-10-10"),
      );
    });
  });
  describe("since", () => {
    it("should parse properly", () => {
      expect(fromPreamble({ since: "2020-10-10" }).since).toEqual(
        new Date("2020-10-10"),
      );
    });
  });
  describe("until", () => {
    it("should parse properly", () => {
      expect(fromPreamble({ until: "2020-10-10" }).until).toEqual(
        new Date("2020-10-10"),
      );
    });
  });
  describe("event", () => {
    it("should parse properly simple date", () => {
      expect(fromPreamble({ event: "2020-10-10" }).event).toEqual({
        start: new Date("2020-10-10"),
        end: new Date("2020-10-10"),
      });
    });
    it("should parse properly start and end", () => {
      expect(
        fromPreamble({ event: { start: "2020-10-10", end: "2020-10-11" } })
          .event,
      ).toEqual({
        start: new Date("2020-10-10"),
        end: new Date("2020-10-11"),
      });
    });
    it("should parse properly start and day duration", () => {
      expect(
        fromPreamble({ event: { start: "2020-10-10", duration: "day" } }).event,
      ).toEqual({
        start: new Date("2020-10-10"),
        end: new Date("2020-10-11"),
      });
    });
    it("should parse properly start and hour duration", () => {
      expect(
        fromPreamble({ event: { start: "2020-10-10", duration: "hour" } })
          .event,
      ).toEqual({
        start: new Date("2020-10-10"),
        end: new Date("2020-10-10T01:00:00.000Z"),
      });
    });
    it("should throw on invalid duration", () => {
      expect(() =>
        fromPreamble({ event: { start: "2020-10-10", duration: "invalid" } }),
      ).toThrowError("duration");
    });
    it("should throw on invalid object", () => {
      expect(() => fromPreamble({ event: 3 })).toThrowError("object");
    });
    it("should throw on missing start", () => {
      expect(() => fromPreamble({ event: {} })).toThrowError("start");
    });
    it("should throw on missing end or duration", () => {
      expect(() =>
        fromPreamble({ event: { start: "2020-10-10" } }),
      ).toThrowError("end or duration");
    });
    it("should throw on when end and duration are both defined", () => {
      expect(() =>
        fromPreamble({
          event: { start: "2020-10-10", end: "2020-10-10", duration: "day" },
        }),
      ).toThrowError("end or duration");
    });
    it("should throw on invalid date", () => {
      expect(() => fromPreamble({ event: { start: "invalid" } })).toThrowError(
        "date",
      );
    });
  });
});
