import { getMatter } from "./processor";

describe("tmp", async () => {
  it("should return def parameter on empty", () => {
    const file = `---
---
`;
    expect(getMatter(file, undefined)).toEqual(undefined);
  });

  it("should parse yaml frontmatter", () => {
    const file = `---
value: true
---
`;
    expect(getMatter(file, undefined)).toEqual({ value: true });
  });
  it("should throw on invalid yaml syntax", () => {
    const file = `---
!: tasdfrue
---
`;
    expect(() => getMatter(file, undefined)).toThrowError();
  });
});
