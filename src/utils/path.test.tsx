import { upDirs, dirname, normalizePath } from "./path";

describe("upDirs", () => {
  it("should return the list of upper directories", () => {
    expect(upDirs("")).toEqual([""]);
    expect(upDirs("x")).toEqual(["", "x"]);
    expect(upDirs("x/y/z")).toEqual(["", "x", "x/y", "x/y/z"]);
  });
});

describe("dirname", () => {
  it("should return dirname of file", () => {
    expect(dirname("toto")).toBe("");
    expect(dirname("/toto")).toBe("");
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
