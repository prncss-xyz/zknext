import {
  NoteData,
  applyQuery,
  nullApplyQueryOpts,
  nullNote,
  nullQuery,
} from ".";

describe("applyQuery", () => {
  it("should return empty", () => {
    const notes = new Map<string, NoteData>();
    expect(applyQuery(nullApplyQueryOpts, notes, nullQuery)).toEqual({
      notes: [],
      restrict: { dirs: [], tags: [], kanbans: []},
    });
  });
  describe("sort", () => {
    describe("should default to lexical sorting", () => {
      const notes = new Map<string, NoteData>([
        ["a.md", { ...nullNote, id: "a.md" }],
        ["c.md", { ...nullNote, id: "c.md" }],
        ["b.md", { ...nullNote, id: "b.md" }],
      ]);
      test("ascending", () => {
        const res = applyQuery(nullApplyQueryOpts, notes, {
          ...nullQuery,
          sort: { field: "mtime", asc: true },
        });
        expect(res.notes.map((note) => note.id)).toEqual([
          "a.md",
          "b.md",
          "c.md",
        ]);
      });
      test("descending", () => {
        const res = applyQuery(nullApplyQueryOpts, notes, {
          ...nullQuery,
          sort: { field: "mtime", asc: false },
        });
        expect(res.notes.map((note) => note.id)).toEqual([
          "c.md",
          "b.md",
          "a.md",
        ]);
      });
    });
  });

  describe("dir", () => {
    const notes = new Map<string, NoteData>([
      ["a.md", { ...nullNote, id: "a.md" }],
      ["a/b.md", { ...nullNote, id: "a/b.md" }],
      ["a/b/c.md", { ...nullNote, id: "a/b/c.md" }],
    ]);
    describe("should filter", () => {
      test("should restrict to dir", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            dir: "a",
          }).notes.map(({ id }) => id),
        ).toEqual(["a/b.md", "a/b/c.md"]);
      });
      test("should restrict to dir", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, nullQuery).restrict.dirs,
        ).toEqual(["", "a", "a/b"]);
      });
    });
  });
  describe("tag", () => {
    const notes = new Map<string, NoteData>([
      ["o.md", { ...nullNote, id: "o.md", tags: [] }],
      ["a.md", { ...nullNote, id: "a.md", tags: ["a", "t"] }],
      ["b.md", { ...nullNote, id: "b.md", tags: ["b",] }],
      ["ab.md", { ...nullNote, id: "ab.md", tags: ["a", "b"] }],
    ]);
    test("should suggests tags", () => {
      expect(
        applyQuery(nullApplyQueryOpts, notes, nullQuery).restrict.tags,
      ).toEqual(["a", "b", "t"]);
    });
    test("should filter single tag", () => {
      expect(
        applyQuery(nullApplyQueryOpts, notes, {
          ...nullQuery,
          tags: ["a"],
        }).notes.map(({ id }) => id),
      ).toEqual(["a.md", "ab.md"]);
    });
    test("should filter multiple tags", () => {
      expect(
        applyQuery(nullApplyQueryOpts, notes, {
          ...nullQuery,
          tags: ["a", "b"],
        }).notes.map(({ id }) => id),
      ).toEqual(["a.md", "ab.md", "b.md"]);
    });
    describe("inverted tags", () => {
      describe("not in query", () => {
        const res = applyQuery(
          { ...nullApplyQueryOpts, invertedTags: ["a"] },
          notes,
          nullQuery,
        );
        test("should exclude inverted tags", () => {
          expect(res.notes.map(({ id }) => id)).toEqual(["b.md", "o.md"]);
        });
        test("put make then available in 'restrict'", () => {
          expect(res.restrict.tags).toEqual(["a", "b", "t"]);
        });
      });
      describe("in query", () => {
        test("unless they are explicitly queried", () => {
          expect(
            applyQuery({ ...nullApplyQueryOpts, invertedTags: ["a"] }, notes, {
              ...nullQuery,
              tags: ["a"],
            }).notes.map(({ id }) => id),
          ).toEqual(["a.md", "ab.md"]);
        });
      });
    });
    describe("kanban", () => {
      it("should suggest available kanbans", () => {
      const res = applyQuery(
        { ...nullApplyQueryOpts, kanbans: { p: ["a", "z"], q: ["z"] } },
        notes,
        nullQuery,
      );
        expect(res.restrict.kanbans).toEqual(["p"]);
      });
      it("should query notes related to kanban", () => {
      const res = applyQuery(
        { ...nullApplyQueryOpts, kanbans: { p: ["a", "z"], q: ["z"] } },
        notes,
        {...nullQuery, kanban: "p"},
      );
        expect(res.notes.map(({ id }) => id)).toEqual(["a.md", "ab.md"]);
      });
    });
  });
  describe("mtime", () => {
    const notes = new Map<string, NoteData>([
      ["a.md", { ...nullNote, id: "a.md", mtime: new Date(1) }],
      ["b.md", { ...nullNote, id: "b.md", mtime: new Date(3) }],
      ["c.md", { ...nullNote, id: "c.md", mtime: new Date(2) }],
    ]);
    describe("should sort", () => {
      test("ascending", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            sort: { field: "mtime", asc: true },
          }).notes.map((note) => note.id),
        ).toEqual(["a.md", "c.md", "b.md"]);
      });
      test("descending", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            sort: { field: "mtime", asc: false },
          }).notes.map((note) => note.id),
        ).toEqual(["b.md", "c.md", "a.md"]);
      });
    });
    describe("should filter", () => {
      test("lte", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            mtime: { lte: new Date(2) },
          }).notes.map((note) => note.id),
        ).toEqual(["a.md", "c.md"]);
      });
      test("gte", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            mtime: { gte: new Date(2) },
          }).notes.map((note) => note.id),
        ).toEqual(["b.md", "c.md"]);
      });
    });
  });
  describe("wordcount", () => {
    const notes = new Map<string, NoteData>([
      ["a.md", { ...nullNote, id: "a.md", wordcount: 1 }],
      ["b.md", { ...nullNote, id: "b.md", wordcount: 3 }],
      ["c.md", { ...nullNote, id: "c.md", wordcount: 2 }],
    ]);
    describe("should sort", () => {
      test("ascending", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            sort: { field: "wordcount", asc: true },
          }).notes.map((note) => note.id),
        ).toEqual(["a.md", "c.md", "b.md"]);
      });
      test("descending", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            sort: { field: "wordcount", asc: false },
          }).notes.map((note) => note.id),
        ).toEqual(["b.md", "c.md", "a.md"]);
      });
    });
    describe("should filter", () => {
      test("lte", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            wordcount: { lte: 2 },
          }).notes.map((note) => note.id),
        ).toEqual(["a.md", "c.md"]);
      });
      test("gte", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            wordcount: { gte: 2 },
          }).notes.map((note) => note.id),
        ).toEqual(["b.md", "c.md"]);
      });
    });
  });
});
