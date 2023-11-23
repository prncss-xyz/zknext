import { injectable } from "inversify";
import "reflect-metadata";
import { ICache } from "./interface";

@injectable()
export class CacheLive implements ICache {}
