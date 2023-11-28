import { Container, injectable } from "inversify";
import { ConfigType, IConfig } from "../config/interface";
import { INotes, NotesType } from "./interface";
import { NotesLive } from "./live";
import mock from "mock-fs";
import { Failure } from "../interfaces";

@injectable()
export class ConfigMock implements IConfig {
  public readonly value = Promise.resolve({ notebookDir: "dir" });
}

function getContainerNotes() {
  const testContainer = new Container();
  testContainer.bind<IConfig>(ConfigType).to(ConfigMock);
  testContainer.bind<INotes>(NotesType).to(NotesLive);
  return testContainer.get<INotes>(NotesType);
}

describe("notesLive", () => {
  beforeEach(() => {
    mock({
      dir: {
        "1.md": mock.file({ content: "1", mtime: new Date(1) }),
        a: {
          "2.md": mock.file({ content: "2", mtime: new Date(2) }),
          "3.xx": mock.file({ content: "3", mtime: new Date(3) }),
        },
      },
    });
  });
  afterEach(() => {
    mock.restore();
  });
  describe("getNotes", () => {
    test("should list notes from dir", async () => {
      const notes = getContainerNotes();
      console.log(1);
      const entries = await notes.getNotes();
      console.log(2);
      expect(entries.length).toBe(2);
      expect(entries[0].id).toBe("1.md");
      expect(entries[0].mtime).toEqual(new Date(1));
      expect(entries[1].id).toBe("a/2.md");
      expect(entries[1].mtime).toEqual(new Date(2));
    });
  });
  describe("getNote", () => {
    test.skip("should fail when there is no file", async () => {
      const notes = getContainerNotes();
      expect(await notes.getNote("999.md")).toEqual(new Failure("nofile"));
    });
  });
});
