import { getMatter } from "./processor";

describe("tmp", async () => {
  it("should parse yaml frontmatter", () => {
    const file = `---
value: true
---
`;
    expect(getMatter(file)).toEqual({ value: true });
  });
  it("should throw on invalid yaml syntax", () => {
    const file = `---
!: tasdfrue
---
`;
    expect(() => getMatter(file)).toThrowError();
  });
});
