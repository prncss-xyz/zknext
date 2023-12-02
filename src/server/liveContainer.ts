import { Container } from "inversify";
import { ConfigLive } from "./config";
import { CacheLive } from "./cache";
import { IConfig, ConfigType, ICache, CacheType, IRepo, RepoType, INote, NoteType } from "./interface";
import { RepoLive } from "./repo";
import { NoteMD } from "./noteMD";

const liveContainer = new Container();
liveContainer.bind<IConfig>(ConfigType).to(ConfigLive);
liveContainer.bind<ICache>(CacheType).to(CacheLive);
liveContainer.bind<IRepo>(RepoType).to(RepoLive);
liveContainer.bind<INote>(NoteType).to(NoteMD);

export const notes = liveContainer.get<IRepo>(RepoType);
