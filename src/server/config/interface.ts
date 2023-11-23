interface ResolvedConfig {
  notebookDir: string;
}

export interface IConfig {
  readonly value: Promise<ResolvedConfig>;
}
export const ConfigType = Symbol.for("Config")
