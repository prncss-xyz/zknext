import { injectable } from "inversify";
import "reflect-metadata";
import { ConfigData, IConfig } from "./interface";

async function getConfig_() {
  const notebookDir = process.env.ZK_NOTEBOOK_DIR;
  if (!notebookDir) throw new Error("ZK_NOTEBOOK_DIR not set");
  return { notebookDir };
}

@injectable()
export class ConfigLive implements IConfig {
  cache: ConfigData | undefined;
  async getConfig() {
    this.cache ??= await getConfig_();
    return this.cache;
  }
}
