import * as O from "optics-ts";

describe("optics", () => {
  // this is not testing the application, but an undocumented assumption
  // about optics-ts
  describe("library", () => {
    interface Test {
      a: {
        b: number;
      };
      c: number;
    }
    const x: Test = { a: { b: 1 }, c: 2 };
    it("should reuse structure on update", () => {
      const lens = O.optic<Test>().prop("c");
      const y = O.set(lens)(3)(x);
      expect(y.a).toBe(x.a);
    });
  });
});
