import { analyseMD } from "./analyseMD";

describe("analyseMD", () => {
  test("should find the title when there is one", async () => {
    const res = await analyseMD("# title");
    expect(res._tag === "success" && res.result.title).toEqual("title");
  });
  test("should return null when there is no title", async () => {
    const res = await analyseMD("title");
    expect(res._tag === "success" && res.result.title).toEqual(null);
  });
  test.skip("should return failure when contents are not parsable", async () => {
    const res = await analyseMD("[");
    expect(res._tag).toBe("failure");
  });
  test("should find the links", async () => {
    const res = await analyseMD("# title");
    expect(res._tag === "success" && res.result.links).toEqual([]);
  });
  test("should return null when there is no title", async () => {
    const res = await analyseMD(
      `

[[a]]

pre
[[b.md]]
post

`,
    );
    expect(res._tag === "success" && res.result.links.length).toBe(2);
    expect(res._tag === "success" && res.result.links[0]).toContain({
      target: "a.md",
    });
    expect(res._tag === "success" && res.result.links[1]).toContain({
      target: "b.md",
    });
    expect(res._tag === "success" && res.result.links[1].context).toMatch(
      /^pre/,
    );
    expect(res._tag === "success" && res.result.links[1].context).toMatch(
      /post$/,
    );
  });
});

//TODO: test links
//TODO: erronous
