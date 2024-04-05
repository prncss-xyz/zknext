import { Container, injectable } from "inversify";
import {
  ConfigType,
  DBType,
  IConfig,
  IDB,
  INoteFile,
  IRepo,
  NoteType,
  RepoType,
} from "../interface";
import mock from "mock-fs";
import { RepoLive } from ".";
import { NoteFileMD } from "../noteFileMD";
import { INote } from "@/core/note";

@injectable()
export class ConfigMock implements IConfig {
  async getConfig() {
    return { notebookDir: "dir", cache: "cacheDir/cache.sqlite3" };
  }
}

@injectable()
export class DBMock implements IDB {
  async init() {
    return;
  }
  async updateNote(_note: INote) {
    return;
  }
  async deleteNote(_id: string) {
    return;
  }
  async getNotes() {
    return [];
  }
}

function getContainerNotes() {
  const testContainer = new Container();
  testContainer.bind<IConfig>(ConfigType).to(ConfigMock);
  testContainer.bind<IDB>(DBType).to(DBMock);
  testContainer.bind<INoteFile>(NoteType).to(NoteFileMD);
  testContainer.bind<IRepo>(RepoType).to(RepoLive);
  return testContainer.get<IRepo>(RepoType);
}

describe("notesLive", () => {
  beforeAll(() => {
    mock({
      dir: {
        "1.md": mock.file({ content: "# jkl\n\nasdf", mtime: new Date(1) }),
        a: {
          "2.md": mock.file({ content: "2", mtime: new Date(2) }),
          "3.xx": mock.file({ content: "3", mtime: new Date(3) }),
          "4.md": mock.file({
            content: "---\n!:error\n---",
            mtime: new Date(4),
          }),
        },
      },
    });
  });
  afterAll(() => {
    mock.restore();
  });
  describe("getNotes", () => {
    it("should list notes from dir", async () => {
      const notes = getContainerNotes();
      const entries = await notes.getNotes();
      expect(entries.length).toBe(2);
      expect(entries[0].id).toBe("1.md");
      expect(entries[0].mtime).toEqual(new Date(1));
      expect(entries[1].id).toBe("a/2.md");
      expect(entries[1].mtime).toEqual(new Date(2));
    });
  });
  describe("getNote", () => {
    it("should fail when there is no file", async () => {
      const notes = getContainerNotes();
      expect(await notes.getNote("999.md")).toBeUndefined();
    });
  });
  describe("getHTML", () => {
    const notes = getContainerNotes();
    it("should fail when there is no file", async () => {
      expect(await notes.getHTML("999.md", true)).toEqual("");
    });
    it("should parse file to HTML document", async () => {
      const html = await notes.getHTML("1.md", true);
      expect(html).toMatch("<title>jkl</title>");
      expect(html).toMatch("<p>asdf</p>");
    });
    it("should report syntax error", async () => {
      const message = await notes.getHTML("a/4.md", true);
      expect(message).toBe("");
    });
    it("should report nofile error", async () => {
      const message = await notes.getHTML("4.md", true);
      expect(message).toBe("");
    });
  });
});
