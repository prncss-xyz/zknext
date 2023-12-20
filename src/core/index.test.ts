import {
  NoteData,
  applyQuery,
  getSorter,
  nullApplyQueryOpts,
  nullNote,
  nullQuery,
} from ".";

describe("applyQuery", () => {
  it("should return empty", () => {
    const notes = new Map<string, NoteData>();
    expect(applyQuery(nullApplyQueryOpts, notes, nullQuery)).toEqual({
      notes: [],
      hidden: 0,
      restrict: { dirs: [], tags: [], kanbans: [] },
    });
  });
  describe("sort", () => {
    const notes = [
      { ...nullNote, id: "a.md" },
      { ...nullNote, id: "c.md" },
      { ...nullNote, id: "b.md" },
    ];
    describe("should sort by id", () => {
      test("ascending", () => {
        const res = notes.sort(getSorter({ field: "id", asc: true }));
        expect(res.map((note) => note.id)).toEqual(["a.md", "b.md", "c.md"]);
      });
      test("descending", () => {
        const res = notes.sort(getSorter({ field: "id", asc: false }));
        expect(res.map((note) => note.id)).toEqual(["c.md", "b.md", "a.md"]);
      });
    });
    describe("should default to id sorting", () => {
      test("ascending", () => {
        const res = notes.sort(getSorter({ field: "mtime", asc: true }));
        expect(res.map((note) => note.id)).toEqual(["a.md", "b.md", "c.md"]);
      });
      test("descending", () => {
        const res = notes.sort(getSorter({ field: "mtime", asc: false }));
        expect(res.map((note) => note.id)).toEqual(["c.md", "b.md", "a.md"]);
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
          })
            .notes.map(({ id }) => id)
            .sort(),
        ).toEqual(["a/b.md", "a/b/c.md"]);
      });
      test("should restrict to dir", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, nullQuery).restrict.dirs.sort(),
        ).toEqual(["", "a", "a/b"]);
      });
    });
  });
  describe("tag", () => {
    const notes = new Map<string, NoteData>([
      ["o.md", { ...nullNote, id: "o.md", tags: [] }],
      ["a.md", { ...nullNote, id: "a.md", tags: ["a", "t/u"] }],
      ["b.md", { ...nullNote, id: "b.md", tags: ["b"] }],
      ["ab.md", { ...nullNote, id: "ab.md", tags: ["a", "b"] }],
    ]);
    test("should suggests tags", () => {
      expect(
        applyQuery(nullApplyQueryOpts, notes, nullQuery).restrict.tags,
      ).toEqual(["", "a", "b", "t", "t/u"]);
    });
    test("should filter single tag", () => {
      expect(
        applyQuery(nullApplyQueryOpts, notes, {
          ...nullQuery,
          tags: ["a"],
        })
          .notes.map(({ id }) => id)
          .sort(),
      ).toEqual(["a.md", "ab.md"]);
    });
    test("should filter multiple tags", () => {
      expect(
        applyQuery(nullApplyQueryOpts, notes, {
          ...nullQuery,
          tags: ["a", "b"],
        })
          .notes.map(({ id }) => id)
          .sort(),
      ).toEqual(["a.md", "ab.md", "b.md"]);
    });
    describe("hidden tags", () => {
      describe("non hidden query", () => {
        const res = applyQuery(
          { ...nullApplyQueryOpts, hidden: { ...nullQuery, tags: ["a"] } },
          notes,
          nullQuery,
        );
        test("hidden query should be excluded", () => {
          expect(res.notes.map(({ id }) => id).sort()).toEqual([
            "b.md",
            "o.md",
          ]);
        });
        test("but hidden results should be counted", () => {
          expect(res.hidden).toBe(2);
        });
      });
      describe("hidden query", () => {
        test("hidden results should be shown", () => {
          expect(
            applyQuery(
              { ...nullApplyQueryOpts, hidden: { ...nullQuery, tags: ["a"] } },
              notes,
              {
                ...nullQuery,
                tags: ["a"],
                hidden: true,
              },
            )
              .notes.map(({ id }) => id)
              .sort(),
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
          { ...nullQuery, kanban: "p" },
        );
        expect(res.notes.map(({ id }) => id).sort()).toEqual(["a.md", "ab.md"]);
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
          applyQuery(nullApplyQueryOpts, notes, nullQuery)
            .notes.sort(getSorter({ field: "mtime", asc: true }))
            .map((note) => note.id),
        ).toEqual(["a.md", "c.md", "b.md"]);
      });
      test("descending", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, nullQuery)
            .notes.sort(getSorter({ field: "mtime", asc: false }))
            .map((note) => note.id),
        ).toEqual(["b.md", "c.md", "a.md"]);
      });
    });
    describe("should filter", () => {
      test("lte", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            mtime: { lte: new Date(2) },
          })
            .notes.map((note) => note.id)
            .sort(),
        ).toEqual(["a.md", "c.md"]);
      });
      test("gte", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            mtime: { gte: new Date(2) },
          })
            .notes.map((note) => note.id)
            .sort(),
        ).toEqual(["b.md", "c.md"]);
      });
    });
  });
  describe("due", () => {
    const notes = new Map<string, NoteData>([
      ["a.md", { ...nullNote, id: "a.md", due: new Date(1) }],
      ["b.md", { ...nullNote, id: "b.md", due: new Date(3) }],
      ["e.md", { ...nullNote, id: "e.md" }],
      ["c.md", { ...nullNote, id: "c.md", due: new Date(2) }],
    ]);
    describe("should sort", () => {
      test("ascending", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, nullQuery)
            .notes.sort(getSorter({ field: "due", asc: true }))
            .map((note) => note.id),
        ).toEqual(["e.md", "a.md", "c.md", "b.md"]);
      });
      test("descending", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, nullQuery)
            .notes.sort(getSorter({ field: "due", asc: false }))
            .map((note) => note.id),
        ).toEqual(["b.md", "c.md", "a.md", "e.md"]);
      });
    });
    describe("should filter", () => {
      test("lte", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            due: { lte: new Date(2) },
          })
            .notes.map((note) => note.id)
            .sort(),
        ).toEqual(["a.md", "c.md"]);
      });
      test("gte", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            due: { gte: new Date(2) },
          })
            .notes.map((note) => note.id)
            .sort(),
        ).toEqual(["b.md", "c.md"]);
      });
    });
  });
  describe("until", () => {
    const notes = new Map<string, NoteData>([
      ["a.md", { ...nullNote, id: "a.md", until: new Date(1) }],
      ["b.md", { ...nullNote, id: "b.md", until: new Date(3) }],
      ["e.md", { ...nullNote, id: "e.md" }],
      ["c.md", { ...nullNote, id: "c.md", until: new Date(2) }],
    ]);
    describe("should sort", () => {
      test("ascending", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, nullQuery)
            .notes.sort(getSorter({ field: "until", asc: true }))
            .map((note) => note.id),
        ).toEqual(["e.md", "a.md", "c.md", "b.md"]);
      });
      test("descending", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, nullQuery)
            .notes.sort(getSorter({ field: "until", asc: false }))
            .map((note) => note.id),
        ).toEqual(["b.md", "c.md", "a.md", "e.md"]);
      });
    });
    describe("should filter", () => {
      test("lte", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            until: { lte: new Date(2) },
          })
            .notes.map((note) => note.id)
            .sort(),
        ).toEqual(["a.md", "c.md"]);
      });
      test("gte", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            until: { gte: new Date(2) },
          })
            .notes.map((note) => note.id)
            .sort(),
        ).toEqual(["b.md", "c.md"]);
      });
    });
  });
  describe("since", () => {
    const notes = new Map<string, NoteData>([
      ["a.md", { ...nullNote, id: "a.md", since: new Date(1) }],
      ["b.md", { ...nullNote, id: "b.md", since: new Date(3) }],
      ["e.md", { ...nullNote, id: "e.md" }],
      ["c.md", { ...nullNote, id: "c.md", since: new Date(2) }],
    ]);
    describe("should sort", () => {
      test("ascending", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, nullQuery)
            .notes.sort(getSorter({ field: "since", asc: true }))
            .map((note) => note.id),
        ).toEqual(["e.md", "a.md", "c.md", "b.md"]);
      });
      test("descending", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, nullQuery)
            .notes.sort(getSorter({ field: "since", asc: false }))
            .map((note) => note.id),
        ).toEqual(["b.md", "c.md", "a.md", "e.md"]);
      });
    });
    describe("should filter", () => {
      test("lte", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            since: { lte: new Date(2) },
          })
            .notes.map((note) => note.id)
            .sort(),
        ).toEqual(["a.md", "c.md"]);
      });
      test("gte", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            since: { gte: new Date(2) },
          })
            .notes.map((note) => note.id)
            .sort(),
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
          applyQuery(nullApplyQueryOpts, notes, nullQuery)
            .notes.sort(getSorter({ field: "wordcount", asc: true }))
            .map((note) => note.id),
        ).toEqual(["a.md", "c.md", "b.md"]);
      });
      test("descending", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, nullQuery)
            .notes.sort(getSorter({ field: "wordcount", asc: false }))
            .map((note) => note.id),
        ).toEqual(["b.md", "c.md", "a.md"]);
      });
    });
    describe("should filter", () => {
      test("lte", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            wordcount: { lte: 2 },
          })
            .notes.map((note) => note.id)
            .sort(),
        ).toEqual(["a.md", "c.md"]);
      });
      test("gte", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            wordcount: { gte: 2 },
          })
            .notes.map((note) => note.id)
            .sort(),
        ).toEqual(["b.md", "c.md"]);
      });
    });
  });
  describe("event", () => {
    const dateA = new Date("2020-10-10");
    const dateB = new Date("2020-10-11");
    const notes = new Map<string, NoteData>([
      ["a.md", { ...nullNote, id: "a.md", event: { start: dateB, end: null } }],
      [
        "b.md",
        { ...nullNote, id: "b.md", event: { start: dateB, end: dateB } },
      ],
      [
        "c.md",
        { ...nullNote, id: "c.md", event: { start: dateB, end: dateB } },
      ],
      [
        "d.md",
        { ...nullNote, id: "d.md", event: { start: dateA, end: dateB } },
      ],
      [
        "e.md",
        { ...nullNote, id: "e.md", event: { start: dateA, end: dateA } },
      ],
      ["f.md", { ...nullNote, id: "f.md", event: { start: null, end: null } }],
      ["g.md", { ...nullNote, id: "g.md", event: { start: null, end: dateA } }],
      ["h.md", { ...nullNote, id: "h.md", event: { start: null, end: dateB } }],
      ["i.md", { ...nullNote, id: "i.md" }],
    ]);
    it("should sort", () => {
      expect(
        applyQuery(nullApplyQueryOpts, notes, nullQuery)
          .notes.sort(getSorter({ field: "event", asc: true }))
          .map((note) => note.id),
      ).toEqual([
        "g.md",
        "h.md",
        "f.md",
        "e.md",
        "d.md",
        "b.md",
        "c.md",
        "a.md",
        "i.md",
      ]);
    });
    describe("second sample", () => {
      const notesB = new Map<string, NoteData>([
        ["j.md", { ...nullNote, id: "j.md" }],
        ["i.md", { ...nullNote, id: "i.md" }],
        [
          "h.md",
          { ...nullNote, id: "h.md", event: { start: null, end: dateB } },
        ],
        [
          "g.md",
          { ...nullNote, id: "g.md", event: { start: null, end: dateA } },
        ],
        [
          "f.md",
          { ...nullNote, id: "f.md", event: { start: null, end: null } },
        ],
        [
          "e.md",
          { ...nullNote, id: "e.md", event: { start: dateA, end: dateA } },
        ],
        [
          "d.md",
          { ...nullNote, id: "d.md", event: { start: dateA, end: dateB } },
        ],
        [
          "c.md",
          { ...nullNote, id: "c.md", event: { start: dateB, end: dateB } },
        ],
        [
          "b.md",
          { ...nullNote, id: "b.md", event: { start: dateB, end: dateB } },
        ],
        [
          "a.md",
          { ...nullNote, id: "a.md", event: { start: dateB, end: null } },
        ],
      ]);
      it("should sort", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notesB, nullQuery)
            .notes.sort(getSorter({ field: "event", asc: true }))
            .map((note) => note.id),
        ).toEqual([
          "g.md",
          "h.md",
          "f.md",
          "e.md",
          "d.md",
          "b.md",
          "c.md",
          "a.md",
          "i.md",
          "j.md",
        ]);
      });
    });
    describe("should filter", () => {
      test("exists", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            event: {},
          })
            .notes.map(({ id }) => id)
            .sort(),
        ).toEqual([
          "a.md",
          "b.md",
          "c.md",
          "d.md",
          "e.md",
          "f.md",
          "g.md",
          "h.md",
        ]);
      });
      test("lte", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            event: { lte: dateA },
          })
            .notes.map(({ id }) => id)
            .sort(),
        ).toEqual(["d.md", "e.md", "f.md", "g.md", "h.md"]);
      });
      test("gte", () => {
        expect(
          applyQuery(nullApplyQueryOpts, notes, {
            ...nullQuery,
            event: { gte: dateB },
          })
            .notes.map(({ id }) => id)
            .sort(),
        ).toEqual(["a.md", "b.md", "c.md", "d.md", "f.md", "h.md"]);
      });
    });
  });
});
describe("since", () => {
  const notes = new Map<string, NoteData>([
    ["c.md", { ...nullNote, id: "c.md", since: new Date(2) }],
    ["e.md", { ...nullNote, id: "e.md" }],
    ["b.md", { ...nullNote, id: "b.md", since: new Date(3) }],
    ["a.md", { ...nullNote, id: "a.md", since: new Date(1) }],
  ]);
  describe("should sort", () => {
    test("ascending", () => {
      expect(
        applyQuery(nullApplyQueryOpts, notes, nullQuery)
          .notes.sort(getSorter({ field: "since", asc: true }))
          .map((note) => note.id),
      ).toEqual(["e.md", "a.md", "c.md", "b.md"]);
    });
    test("descending", () => {
      expect(
        applyQuery(nullApplyQueryOpts, notes, nullQuery)
          .notes.sort(getSorter({ field: "since", asc: false }))
          .map((note) => note.id),
      ).toEqual(["b.md", "c.md", "a.md", "e.md"]);
    });
  });
  describe("should filter", () => {
    test("lte", () => {
      expect(
        applyQuery(nullApplyQueryOpts, notes, {
          ...nullQuery,
          since: { lte: new Date(2) },
        })
          .notes.map((note) => note.id)
          .sort(),
      ).toEqual(["a.md", "c.md"]);
    });
    test("gte", () => {
      expect(
        applyQuery(nullApplyQueryOpts, notes, {
          ...nullQuery,
          since: { gte: new Date(2) },
        })
          .notes.map((note) => note.id)
          .sort(),
      ).toEqual(["b.md", "c.md"]);
    });
  });
});
