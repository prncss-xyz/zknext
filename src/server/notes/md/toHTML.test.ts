import { Errable, fromFailure, fromSuccess } from "@/server/utils/errable";
import { NoteData } from "../interface";
import { mdToHTML } from "./toHTML";
import { mdToMeta } from "./toMeta";

describe("parseMD", async () => {
  const files = {
    "a.md": "",
    "b.md": "# title b\ncontents",
    "c.md": "---\n---\n# title c\n[[a.md]]\n[[b.md]]\n[[999.md]]",
    "d.md": "---\n!: error\n---",
  };
  const idToMeta = new Map<string, Errable<NoteData>>();
  for (const [k, v] of Object.entries(files)) {
    idToMeta.set(k, await mdToMeta({ id: k, mtime: new Date(0) }, v));
  }
  it("should parse empty string", async () => {
    const res = fromSuccess(
      await mdToHTML(files["a.md"], {
        id: "a.md",
        idToMeta: idToMeta,
        document: false,
        untitled: "untitled",
      }),
    );
    expect(res).toEqual("");
  });
  it("should use untitled when there is no title", async () => {
    const res = await mdToHTML(files["a.md"], {
      id: "a.md",
      idToMeta: idToMeta,
      document: true,
      untitled: "untitled_param",
    });
    expect(res._tag === "success");
    expect(fromSuccess(res)).toMatch("html");
    expect(fromSuccess(res)).toMatch("<title>untitled_param</title>");
  });
  it("should use title when there is one", async () => {
    const res = await mdToHTML(files["b.md"], {
      id: "b.md",
      idToMeta: idToMeta,
      document: true,
      untitled: "untitled_param",
    });
    expect(res._tag === "success");
    expect(fromSuccess(res)).toMatch("html");
    expect(fromSuccess(res)).toMatch("<title>title b</title>");
  });
  it("should render links with appropriate class", async () => {
    const res = await mdToHTML(files["c.md"], {
      id: "c.md",
      idToMeta: idToMeta,
      document: true,
      untitled: "untitled_param",
    });
    expect(res._tag === "success");
    const html = fromSuccess(res);
    expect(html).toMatch(`<a class="internal" href="a.md">a.md</a>`);
    expect(html).toMatch(`<a class="internal titled" href="b.md">title b</a>`);
    expect(html).toMatch(`<a class="internal broken" href="999.md">999.md</a>`);
  });
  it("should report syntax error", async () => {
    const res = await mdToHTML(files["d.md"], {
      id: "d.md",
      idToMeta: idToMeta,
      document: true,
      untitled: "untitled_param",
    });
    expect(res._tag === "failure");
    const message = fromFailure(res);
    expect(message).toBe("syntax error (preamble)")
  });
});
