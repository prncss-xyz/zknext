import { Container } from "inversify";
import { ConfigLive } from "./config";
import { CacheLive } from "./cache";
import { IConfig, ConfigType, ICache, CacheType, IRepo, RepoType, INoteFile, NoteType, DBType, IDB } from "./interface";
import { RepoLive } from "./repo";
import { NoteFileMD } from "./noteFileMD";
import { DBLive } from "./db";

const liveContainer = new Container();
liveContainer.bind<IConfig>(ConfigType).to(ConfigLive);
liveContainer.bind<ICache>(CacheType).to(CacheLive);
liveContainer.bind<IRepo>(RepoType).to(RepoLive);
liveContainer.bind<INoteFile>(NoteType).to(NoteFileMD);
liveContainer.bind<IDB>(DBType).to(DBLive);

export const notes = liveContainer.get<IRepo>(RepoType);
