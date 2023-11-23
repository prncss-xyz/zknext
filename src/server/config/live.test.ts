import { Container } from "inversify";
import { IConfig, ConfigType } from "./interface";
import { ConfigLive } from "./live";

function getTestContainer() {
  const testContainer = new Container();
  testContainer.bind<IConfig>(ConfigType).to(ConfigLive);
  return testContainer.get<IConfig>(ConfigType);
}

describe("configLive", () => {
  describe("description", () => {
    let NOTEBOOK_DIR: string | undefined;
    beforeAll(() => {
      NOTEBOOK_DIR = process.env.ZK_NOTEBOOK_DIR;
    });
    afterAll(() => {
      process.env.ZK_NOTEBOOK_DIR = NOTEBOOK_DIR;
    });
    it("should get notebookDir from env", async () => {
      process.env.ZK_NOTEBOOK_DIR = "dir";
      const config = getTestContainer();
      const configValue = await config.value;
      expect(configValue.notebookDir).toBe("dir");
    });
    it("should throw when env is not set", async () => {
      delete process.env.ZK_NOTEBOOK_DIR;
      const config = getTestContainer();
      await expect(() => config.value).rejects.toThrowError(
        "ZK_NOTEBOOK_DIR not set",
      );
    });
  });
});
