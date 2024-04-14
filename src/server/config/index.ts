import { injectable } from "inversify";
import "reflect-metadata";
import { ConfigData, IConfig } from "../interface";

import { join } from "node:path";
import { xdgCache } from "xdg-basedir";
import { createHash } from "node:crypto";

async function getConfig_() {
  const notebookDir = process.env.ZK_NOTEBOOK_DIR;
  if (!notebookDir) throw new Error("ZK_NOTEBOOK_DIR not set");
  if (xdgCache === undefined) throw new Error("xdgCache undefined");
  const hash = createHash("md5").update(notebookDir).digest("hex");
  const cache = join(xdgCache, "zknext", hash + ".sqlite3");
  const shouldWatch = true;
  return {
    notebookDir,
    cache,
    shouldWatch,
  };
}

@injectable()
export class ConfigLive implements IConfig {
  cache: ConfigData | undefined;
  async getConfig() {
    this.cache ??= await getConfig_();
    return this.cache;
  }
}
