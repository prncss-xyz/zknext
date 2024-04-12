// we test both filters and sorters here in order to use the same samples

import { INote, nullNote } from "./note";
import { applyFilter, nullApplyFilterOpts, nullFilter } from "./filters";
import { getSorter } from "./sorters";

describe("applyQuery", () => {
  it("should return empty", () => {
    const notes: INote[] = [];
    expect(applyFilter(nullApplyFilterOpts, nullFilter, notes)).toEqual({
      notes: [],
      restrict: {
        ids: [],
        tags: [],
        kanbans: [],
        due: false,
        event: false,
        since: false,
        until: false,
        hidden: 0,
      },
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
    const notes = [
      { ...nullNote, id: "a.md" },
      { ...nullNote, id: "a/b.md" },
      { ...nullNote, id: "a/b/c.md" },
    ];
    describe("should filter", () => {
      test("should restrict to dir", () => {
        expect(
          applyFilter(
            nullApplyFilterOpts,
            {
              ...nullFilter,
              dir: "a",
            },
            notes,
          )
            .notes.map(({ id }) => id)
            .sort(),
        ).toEqual(["a/b.md", "a/b/c.md"]);
      });
      test("should restrict to dir", () => {
        expect(
          applyFilter(
            nullApplyFilterOpts,
            nullFilter,
            notes,
          ).restrict.ids.sort(),
        ).toEqual(["", "a", "a/b"]);
      });
    });
  });
  describe("tag", () => {
    const notes = [
      { ...nullNote, id: "o.md", tags: [] },
      { ...nullNote, id: "a.md", tags: ["a", "t/u"] },
      { ...nullNote, id: "b.md", tags: ["b"] },
      { ...nullNote, id: "ab.md", tags: ["a", "b"] },
    ];
    test("should suggests tags", () => {
      expect(
        applyFilter(nullApplyFilterOpts, nullFilter, notes).restrict.tags,
      ).toEqual(["a", "b", "t", "t/u"]);
    });
    test("should filter single tag", () => {
      expect(
        applyFilter(
          nullApplyFilterOpts,
          {
            ...nullFilter,
            tags: ["a"],
          },
          notes,
        )
          .notes.map(({ id }) => id)
          .sort(),
      ).toEqual(["a.md", "ab.md"]);
    });
    test("should filter multiple tags", () => {
      expect(
        applyFilter(
          nullApplyFilterOpts,
          {
            ...nullFilter,
            tags: ["a", "b"],
          },
          notes,
        )
          .notes.map(({ id }) => id)
          .sort(),
      ).toEqual(["a.md", "ab.md", "b.md"]);
    });
    describe("hidden tags", () => {
      describe("non hidden query", () => {
        const res = applyFilter(
          { ...nullApplyFilterOpts, hidden: { ...nullFilter, tags: ["a"] } },
          nullFilter,
          notes,
        );
        test("hidden query should be excluded", () => {
          expect(res.notes.map(({ id }) => id).sort()).toEqual([
            "b.md",
            "o.md",
          ]);
        });
        test("but hidden results should be counted", () => {
          expect(res.restrict.hidden).toBe(2);
        });
      });
      describe("hidden query", () => {
        test("hidden results should be shown", () => {
          expect(
            applyFilter(
              {
                ...nullApplyFilterOpts,
                hidden: { ...nullFilter, tags: ["a"] },
              },
              {
                ...nullFilter,
                tags: ["a"],
                hidden: true,
              },
              notes,
            )
              .notes.map(({ id }) => id)
              .sort(),
          ).toEqual(["a.md", "ab.md"]);
        });
      });
    });
    describe("kanban", () => {
      it("should suggest available kanbans", () => {
        const res = applyFilter(
          { ...nullApplyFilterOpts, kanbans: { p: ["a", "z"], q: ["z"] } },
          nullFilter,
          notes,
        );
        expect(res.restrict.kanbans).toEqual(["p"]);
      });
      it("should query notes related to kanban", () => {
        const res = applyFilter(
          { ...nullApplyFilterOpts, kanbans: { p: ["a", "z"], q: ["z"] } },
          { ...nullFilter, view: { type: "kanban", kanban: "p" } },
          notes,
        );
        expect(res.notes.map(({ id }) => id).sort()).toEqual(["a.md", "ab.md"]);
      });
    });
  });
  describe("mtime", () => {
    const notes = [
      { ...nullNote, id: "a.md", mtime: 1 },
      { ...nullNote, id: "b.md", mtime: 3 },
      { ...nullNote, id: "c.md", mtime: 2 },
    ];
    describe("should sort", () => {
      test("ascending", () => {
        expect(
          applyFilter(nullApplyFilterOpts, nullFilter, notes)
            .notes.sort(getSorter({ field: "mtime", asc: true }))
            .map((note) => note.id),
        ).toEqual(["a.md", "c.md", "b.md"]);
      });
      test("descending", () => {
        expect(
          applyFilter(nullApplyFilterOpts, nullFilter, notes)
            .notes.sort(getSorter({ field: "mtime", asc: false }))
            .map((note) => note.id),
        ).toEqual(["b.md", "c.md", "a.md"]);
      });
    });
    describe("should filter", () => {
      test("end", () => {
        expect(
          applyFilter(
            nullApplyFilterOpts,
            {
              ...nullFilter,
              mtime: { end: 2 },
            },
            notes,
          )
            .notes.map((note) => note.id)
            .sort(),
        ).toEqual(["a.md", "c.md"]);
      });
      test("start", () => {
        expect(
          applyFilter(
            nullApplyFilterOpts,
            {
              ...nullFilter,
              mtime: { start: 2 },
            },
            notes,
          )
            .notes.map((note) => note.id)
            .sort(),
        ).toEqual(["b.md", "c.md"]);
      });
    });
  });
  describe("due", () => {
    const notes = [
      { ...nullNote, id: "a.md", due: 1 },
      { ...nullNote, id: "b.md", due: 3 },
      { ...nullNote, id: "e.md" },
      { ...nullNote, id: "c.md", due: 2 },
    ];
    describe("should sort", () => {
      test("ascending", () => {
        expect(
          applyFilter(nullApplyFilterOpts, nullFilter, notes)
            .notes.sort(getSorter({ field: "due", asc: true }))
            .map((note) => note.id),
        ).toEqual(["a.md", "c.md", "b.md", "e.md"]);
      });
      test("descending", () => {
        expect(
          applyFilter(nullApplyFilterOpts, nullFilter, notes)
            .notes.sort(getSorter({ field: "due", asc: false }))
            .map((note) => note.id),
        ).toEqual(["e.md", "b.md", "c.md", "a.md"]);
      });
    });
    describe("should filter", () => {
      test("end", () => {
        expect(
          applyFilter(
            nullApplyFilterOpts,
            {
              ...nullFilter,
              due: { end: 2 },
            },
            notes,
          )
            .notes.map((note) => note.id)
            .sort(),
        ).toEqual(["a.md", "c.md"]);
      });
      test("start", () => {
        expect(
          applyFilter(
            nullApplyFilterOpts,
            {
              ...nullFilter,
              due: { start: 2 },
            },
            notes,
          )
            .notes.map((note) => note.id)
            .sort(),
        ).toEqual(["b.md", "c.md"]);
      });
    });
  });
  describe("until", () => {
    const notes = [
      { ...nullNote, id: "a.md", until: 1 },
      { ...nullNote, id: "b.md", until: 3 },
      { ...nullNote, id: "e.md" },
      { ...nullNote, id: "c.md", until: 2 },
    ];
    describe("should sort", () => {
      test("ascending", () => {
        expect(
          applyFilter(nullApplyFilterOpts, nullFilter, notes)
            .notes.sort(getSorter({ field: "until", asc: true }))
            .map((note) => note.id),
        ).toEqual(["a.md", "c.md", "b.md", "e.md"]);
      });
      test("descending", () => {
        expect(
          applyFilter(nullApplyFilterOpts, nullFilter, notes)
            .notes.sort(getSorter({ field: "until", asc: false }))
            .map((note) => note.id),
        ).toEqual(["e.md", "b.md", "c.md", "a.md"]);
      });
    });
    describe("should filter", () => {
      test("end", () => {
        expect(
          applyFilter(
            nullApplyFilterOpts,
            {
              ...nullFilter,
              until: { end: 2 },
            },
            notes,
          )
            .notes.map((note) => note.id)
            .sort(),
        ).toEqual(["a.md", "c.md"]);
      });
      test("start", () => {
        expect(
          applyFilter(
            nullApplyFilterOpts,
            {
              ...nullFilter,
              until: { start: 2 },
            },
            notes,
          )
            .notes.map((note) => note.id)
            .sort(),
        ).toEqual(["b.md", "c.md"]);
      });
    });
  });
  describe("since", () => {
    const notes = [
      { ...nullNote, id: "a.md", since: 1 },
      { ...nullNote, id: "b.md", since: 3 },
      { ...nullNote, id: "e.md" },
      { ...nullNote, id: "c.md", since: 2 },
    ];
    describe("should sort", () => {
      test("ascending", () => {
        expect(
          applyFilter(nullApplyFilterOpts, nullFilter, notes)
            .notes.sort(getSorter({ field: "since", asc: true }))
            .map((note) => note.id),
        ).toEqual(["a.md", "c.md", "b.md", "e.md"]);
      });
      test("descending", () => {
        expect(
          applyFilter(nullApplyFilterOpts, nullFilter, notes)
            .notes.sort(getSorter({ field: "since", asc: false }))
            .map((note) => note.id),
        ).toEqual(["e.md", "b.md", "c.md", "a.md"]);
      });
    });
    describe("should filter", () => {
      test("end", () => {
        expect(
          applyFilter(
            nullApplyFilterOpts,
            {
              ...nullFilter,
              since: { end: 2 },
            },
            notes,
          )
            .notes.map((note) => note.id)
            .sort(),
        ).toEqual(["a.md", "c.md"]);
      });
      test("start", () => {
        expect(
          applyFilter(
            nullApplyFilterOpts,
            {
              ...nullFilter,
              since: { start: 2 },
            },
            notes,
          )
            .notes.map((note) => note.id)
            .sort(),
        ).toEqual(["b.md", "c.md"]);
      });
    });
  });
  describe("wordcount", () => {
    const notes = [
      { ...nullNote, id: "a.md", wordcount: 1 },
      { ...nullNote, id: "b.md", wordcount: 3 },
      { ...nullNote, id: "c.md", wordcount: 2 },
    ];
    describe("should sort", () => {
      test("ascending", () => {
        expect(
          applyFilter(nullApplyFilterOpts, nullFilter, notes)
            .notes.sort(getSorter({ field: "wordcount", asc: true }))
            .map((note) => note.id),
        ).toEqual(["a.md", "c.md", "b.md"]);
      });
      test("descending", () => {
        expect(
          applyFilter(nullApplyFilterOpts, nullFilter, notes)
            .notes.sort(getSorter({ field: "wordcount", asc: false }))
            .map((note) => note.id),
        ).toEqual(["b.md", "c.md", "a.md"]);
      });
    });
    describe("should filter", () => {
      test("end", () => {
        expect(
          applyFilter(
            nullApplyFilterOpts,
            {
              ...nullFilter,
              wordcount: { end: 2 },
            },
            notes,
          )
            .notes.map((note) => note.id)
            .sort(),
        ).toEqual(["a.md", "c.md"]);
      });
      test("start", () => {
        expect(
          applyFilter(
            nullApplyFilterOpts,
            {
              ...nullFilter,
              wordcount: { start: 2 },
            },
            notes,
          )
            .notes.map((note) => note.id)
            .sort(),
        ).toEqual(["b.md", "c.md"]);
      });
    });
  });
  describe("event", () => {
    const dateA = 10;
    const dateB = 11;
    const notes = [
      { ...nullNote, id: "a.md", event: { start: dateB } },
      { ...nullNote, id: "f.md", event: {} },
      { ...nullNote, id: "g.md", event: { end: dateA } },
      { ...nullNote, id: "h.md", event: { end: dateB } },
      { ...nullNote, id: "i.md" },
    ];
    it("should sort", () => {
      expect(
        notes
          .sort(getSorter({ field: "event", asc: true }))
          .map((note) => note.id),
      ).toEqual(["g.md", "h.md", "f.md", "a.md", "i.md"]);
    });
    const notesB = [
      { ...nullNote, id: "j.md" },
      { ...nullNote, id: "i.md" },
      { ...nullNote, id: "h.md", event: { end: dateB } },
      { ...nullNote, id: "g.md", event: { end: dateA } },
      { ...nullNote, id: "f.md", event: {} },
      { ...nullNote, id: "e.md", event: { start: dateA, end: dateA } },
      { ...nullNote, id: "d.md", event: { start: dateA, end: dateB } },
      { ...nullNote, id: "c.md", event: { start: dateB, end: dateB } },
      { ...nullNote, id: "b.md", event: { start: dateB, end: dateB } },
      { ...nullNote, id: "a.md", event: { start: dateB } },
    ];
    describe("second sample", () => {
      it("should sort", () => {
        expect(
          applyFilter(nullApplyFilterOpts, nullFilter, notesB)
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
          applyFilter(
            nullApplyFilterOpts,
            {
              ...nullFilter,
              event: {},
            },
            notesB,
          )
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
      test("end", () => {
        expect(
          applyFilter(
            nullApplyFilterOpts,
            {
              ...nullFilter,
              event: { end: dateA },
            },
            notesB,
          )
            .notes.map(({ id }) => id)
            .sort(),
        ).toEqual(["d.md", "e.md", "f.md", "g.md", "h.md"]);
      });
      test("start", () => {
        expect(
          applyFilter(
            nullApplyFilterOpts,
            {
              ...nullFilter,
              event: { start: dateB },
            },
            notesB,
          )
            .notes.map(({ id }) => id)
            .sort(),
        ).toEqual(["a.md", "b.md", "c.md", "d.md", "f.md", "h.md"]);
      });
    });
  });
});
describe("since", () => {
  const notes = [
    { ...nullNote, id: "c.md", since: 2 },
    { ...nullNote, id: "e.md" },
    { ...nullNote, id: "b.md", since: 3 },
    { ...nullNote, id: "a.md", since: 1 },
  ];
  describe("should sort", () => {
    test("ascending", () => {
      expect(
        applyFilter(nullApplyFilterOpts, nullFilter, notes)
          .notes.sort(getSorter({ field: "since", asc: true }))
          .map((note) => note.id),
      ).toEqual(["a.md", "c.md", "b.md", "e.md"]);
    });
    test("descending", () => {
      expect(
        applyFilter(nullApplyFilterOpts, nullFilter, notes)
          .notes.sort(getSorter({ field: "since", asc: false }))
          .map((note) => note.id),
      ).toEqual(["e.md", "b.md", "c.md", "a.md"]);
    });
  });
  describe("should filter", () => {
    test("end", () => {
      expect(
        applyFilter(
          nullApplyFilterOpts,
          {
            ...nullFilter,
            since: { end: 2 },
          },
          notes,
        )
          .notes.map((note) => note.id)
          .sort(),
      ).toEqual(["a.md", "c.md"]);
    });
    test("start", () => {
      expect(
        applyFilter(
          nullApplyFilterOpts,
          {
            ...nullFilter,
            since: { start: 2 },
          },
          notes,
        )
          .notes.map((note) => note.id)
          .sort(),
      ).toEqual(["b.md", "c.md"]);
    });
  });
});
