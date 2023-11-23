import mock from "mock-fs";
import { getFiles, exists } from "./files";

describe("file tests", () => {
  beforeEach(() => {
    mock({
      ".0": mock.file({ content: "0", mtime: new Date(0) }),
      "1": mock.file({ content: "1", mtime: new Date(1) }),
      a: {
        "2": mock.file({ content: "2", mtime: new Date(2) }),
        "3": mock.file({ content: "3", mtime: new Date(3) }), // update
        b: {
          "4": mock.file({ content: "6", mtime: new Date(6) }), // update
        },
        c: {},
      },
    });
  });
  afterEach(() => {
    mock.restore();
  });

  describe("getFiles", () => {
    it("should list files recursively", async () => {
      let files: string[] = [];
      for await (const file of getFiles(".")) {
        files.push(file);
      }
      files.sort();
      expect(files).toEqual(["1", "a/2", "a/3", "a/b/4"]);
    });
  });

  describe("exists", () => {
    it("should test if a file exists", async () => {
      expect(await exists("1")).toBe(true);
      expect(await exists("0")).toBe(false);
    });
  });
});
