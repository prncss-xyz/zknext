import { Container, injectable } from "inversify";
import { ConfigType, IConfig } from "../config/interface";
import { INotes, NotesType } from "./interface";
import { NotesLive } from "./live";
import mock from "mock-fs";

@injectable()
class ConfigMock implements IConfig {
  value;
  constructor() {
    this.value = Promise.resolve({ notebookDir: "dir" });
  }
}

function getNotes() {
  const testContainer = new Container();
  testContainer.bind<IConfig>(ConfigType).to(ConfigMock);
  testContainer.bind<INotes>(NotesType).to(NotesLive);
  return testContainer.get<INotes>(NotesType);
}

describe("notesLive", () => {
  describe("getNotes", () => {
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
    it("should list notes from dir", async () => {
      const notes = getNotes();
      const entries = await notes.getNotes();
      expect(entries).toEqual([{ id: "1.md" }, { id: "a/2.md" }]);
    });
  });
});
