import { fromSuccess } from "@/utils/errable";
import { getMeta } from "./getMeta";

describe("analyseMD", () => {
  const fileData = { id: "a.md", mtime: new Date(0) };
  it("should find the title when there is one", async () => {
    const res_ = await getMeta(fileData, "# title");
    expect(res_._tag).toBe("success");
    const res = fromSuccess(res_);
    expect(res.title).toEqual("title");
  });
  it("should return null when there is no title", async () => {
    const res_ = await getMeta(fileData, "title\n");
    expect(res_._tag).toBe("success");
    const res = fromSuccess(res_);
    expect(res.title).toEqual(null);
  });
  it("should return failure when contents are not parsable", async () => {
    const file = `---
!: tasdfrue
---
`;
    const res = await getMeta(fileData, file);
    expect(res._tag).toBe("failure");
  });
  it("should find the links", async () => {
    const res_ = await getMeta(fileData, "# title");
    expect(res_._tag).toBe("success");
    const res = fromSuccess(res_);
    expect(res.links).toEqual([]);
  });
  it("should return null when there is no title", async () => {
    const res_ = await getMeta(
      fileData,
      `---
---

[[a]]

pre
[[b.md]]
post

`,
    );
    expect(res_._tag).toBe("success");
    const res = fromSuccess(res_);
    expect(res.links.length).toBe(2);
    expect(res.links[0]).toContain({
      target: "a.md",
    });
    expect(res.links[1]).toContain({
      target: "b.md",
    });
    expect(res.links[1].context).toMatch(/^pre/);
    expect(res.links[1].context).toMatch(/post$/);
  });
  describe("preamble", () => {
    it("should accept empty preamble", async () => {
      const res_ = await getMeta(fileData, "");
      expect(res_._tag).toEqual("success");
    });
    it("should pass preamble data", async () => {
      const res_ = await getMeta(fileData, "---\ntags: a\n---\n");
      expect(res_._tag).toEqual("success");
      expect(fromSuccess(res_).tags).toEqual(["a"]);
    });
    it("should reject invalid data", async () => {
      const res_ = await getMeta(fileData, "---\ntags: [0]\n---\n");
      expect(res_._tag).toEqual("failure");
    });
  });
});
