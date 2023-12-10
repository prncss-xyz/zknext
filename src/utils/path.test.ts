import { upDirs, dirname, normalizePath, contains } from "./path";

describe("contains", () => {
  test("empty dir contains everything", () => {
    expect(contains("", "")).toBe(true);
    expect(contains("", "a")).toBe(true);
  });
  test("subdir contains parent", () => {
    expect(contains("a", "a/b")).toBe(true);
    expect(contains("a/b", "a/b/c")).toBe(true);
  });
  test("parent does not contain subdir", () => {
    expect(contains("a/b", "a")).toBe(false);
    expect(contains("ab/c", "a/c")).toBe(false);
  });
  test("unrelated does not contain subdir", () => {
    expect(contains("a", "ab/c")).toBe(false);
  });
});

describe("upDirs", () => {
  describe("it should return the list of upper directories", () => {
    test("inclusive", () => {
      expect(upDirs(true, "x.md")).toEqual(["", "x.md"]);
      expect(upDirs(true, "x/y.md")).toEqual(["", "x", "x/y.md"]);
      expect(upDirs(true, "x/y/z.md")).toEqual(["", "x", "x/y", "x/y/z.md"]);
    });
    test("exclusive", () => {
      expect(upDirs(false, "x.md")).toEqual([""]);
      expect(upDirs(false, "x/y.md")).toEqual(["", "x"]);
      expect(upDirs(false, "x/y/z.md")).toEqual(["", "x", "x/y"]);
    });
  });
});

describe("dirname", () => {
  it("should return dirname of file", () => {
    expect(dirname("toto")).toBe("");
    expect(dirname("a/toto")).toBe("a");
    expect(dirname("a/b/toto")).toBe("a/b");
  });
});

describe("normalizePath", () => {
  it("should normalize slash in pathnames", () => {
    expect(normalizePath("to/ta/tu")).toBe("to/ta/tu");
    expect(normalizePath("to\\ta\\tu")).toBe("to/ta/tu");
  });
});
