import { injectable } from "inversify";
import "reflect-metadata";
import { IConfig } from "./interface";

async function getConfig() {
  const notebookDir = process.env.ZK_NOTEBOOK_DIR;
  if (!notebookDir) throw new Error("ZK_NOTEBOOK_DIR not set");
  return { notebookDir };
}

@injectable()
export class ConfigLive implements IConfig {
  public readonly value;
  constructor() {
    this.value = getConfig();
  }
}
