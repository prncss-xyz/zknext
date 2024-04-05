import { fromSuccess } from "@/utils/errable";
import { INote } from "@/core/note";
import { getHTML } from "./getHTML";
import { getMeta } from "./getMeta";

describe("parseMD", async () => {
  const files = {
    "a.md": "",
    "b.md": "# title b\ncontents",
    "c.md": "---\n---\n# title c\n[[a.md]]\n[[b.md]]\n[[999.md]]",
    "d.md": "---\n!: error\n---",
  };
  const idToMeta = new Map<string, INote>();
  for (const [k, v] of Object.entries(files)) {
    const res = await getMeta({ id: k, mtime: new Date(0) }, v);
    if (res._tag === "success") idToMeta.set(k, fromSuccess(res));
  }
  it("should parse empty string", async () => {
    const res = await getHTML(
      {
        id: "a.md",
        idToMeta: idToMeta,
        document: false,
        untitled: "untitled",
      },
      files["a.md"],
    );
    expect(res).toEqual("");
  });
  it("should use untitled when there is no title", async () => {
    const res = await getHTML(
      {
        id: "a.md",
        idToMeta: idToMeta,
        document: true,
        untitled: "untitled_param",
      },
      files["a.md"],
    );
    expect(res).toMatch("html");
    expect(res).toMatch("<title>untitled_param</title>");
  });
  it("should use title when there is one", async () => {
    const res = await getHTML(
      {
        id: "b.md",
        idToMeta: idToMeta,
        document: true,
        untitled: "untitled_param",
      },
      files["b.md"],
    );
    expect(res).toMatch("html");
    expect(res).toMatch("<title>title b</title>");
  });
  it("should render links with appropriate class", async () => {
    const res = await getHTML(
      {
        id: "c.md",
        idToMeta: idToMeta,
        document: true,
        untitled: "untitled_param",
      },
      files["c.md"],
    );
    const html = res;
    expect(html).toMatch(`<a class="internal" href="a.md">a.md</a>`);
    expect(html).toMatch(`<a class="internal titled" href="b.md">title b</a>`);
    expect(html).toMatch(`<a class="internal broken" href="999.md">999.md</a>`);
  });
  it("should report syntax error", async () => {
    const res = await getHTML(
      {
        id: "d.md",
        idToMeta: idToMeta,
        document: true,
        untitled: "untitled_param",
      },
      files["d.md"],
    );
    expect(res).toBe("");
  });
});
