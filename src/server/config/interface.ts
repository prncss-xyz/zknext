export interface ConfigData {
  notebookDir: string;
}
export interface IConfig {
  getConfig: () => Promise<ConfigData>;
}
export const ConfigType = Symbol.for("Config");
