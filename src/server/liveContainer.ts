import { Container } from "inversify";
import { ICache, CacheType } from "./cache/interface";
import { CacheLive } from "./cache/live";
import { IConfig, ConfigType } from "./config/interface";
import { ConfigLive } from "./config/live";
import { INotes, NotesType } from "./notes/interface";
import { NotesLive } from "./notes/live";

const liveContainer = new Container();
liveContainer.bind<IConfig>(ConfigType).to(ConfigLive);
liveContainer.bind<ICache>(CacheType).to(CacheLive);
liveContainer.bind<INotes>(NotesType).to(NotesLive);

export const config = liveContainer.get<IConfig>(ConfigType);
export const cache = liveContainer.get<ICache>(CacheType);
export const notes = liveContainer.get<INotes>(NotesType);
