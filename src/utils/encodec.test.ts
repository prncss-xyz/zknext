import { dateString, numberString } from "./encodec";

describe("encodec", () => {
  describe("numberString", () => {
    describe("encode", () => {
      test("undefined should return empty string", () => {
        expect(numberString.encode(undefined)).toBe("");
      });
      test("number should return number string", () => {
        expect(numberString.encode(0)).toBe("0");
      });
    });
    describe("decode", () => {
      test("empty string should retrun undefined", () => {
        expect(numberString.decode("")).toBeUndefined();
      });
      test("invalid string should retrun undefined", () => {
        expect(numberString.decode("toto")).toBeUndefined();
      });
      test("number string should retrun number", () => {
        expect(numberString.decode("0")).toBe(0);
      });
    });
  });
  describe("dateString", () => {
    describe("encode", () => {
      test("undefined should return empty string", () => {
        expect(dateString.encode(undefined)).toBe("");
      });
      it("should encode a date", () => {
        expect(dateString.encode(0)).toBe("1970-01-01");
      });
    });
    describe("decode", () => {
      test("empty string should retrun undefined", () => {
        expect(dateString.decode("")).toBeUndefined();
      });
      test("invalid string should retrun undefined", () => {
        expect(dateString.decode("toto")).toBeUndefined();
      });
      it("should decode a date", () => {
        expect(dateString.decode("1970")).toBe(0);
      });
    });
  });
});
