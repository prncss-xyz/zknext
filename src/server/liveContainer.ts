import { Container } from "inversify";
import { ConfigLive } from "./config";
import { CacheLive } from "./cache";
import { IConfig, ConfigType, ICache, CacheType, IRepo, RepoType, INoteFile, NoteType } from "./interface";
import { RepoLive } from "./repo";
import { NoteFileMD } from "./noteFileMD";

const liveContainer = new Container();
liveContainer.bind<IConfig>(ConfigType).to(ConfigLive);
liveContainer.bind<ICache>(CacheType).to(CacheLive);
liveContainer.bind<IRepo>(RepoType).to(RepoLive);
liveContainer.bind<INoteFile>(NoteType).to(NoteFileMD);

export const notes = liveContainer.get<IRepo>(RepoType);
