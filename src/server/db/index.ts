import { inject, injectable } from "inversify";
import "reflect-metadata";
import Database from "better-sqlite3";
import { INote } from "@/core/note";
import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import { ConfigType } from "../interface";
import type { IConfig, IDB } from "../interface";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

interface Database {
  note: INoteTable;
}

function encode(note: INote): INoteTable {
  return {
    id: note.id,
    note,
  };
}

interface INoteTable {
  id: string;
  note: INote;
}

type InternalDB = Awaited<ReturnType<typeof initDb>>;

async function initDb(filepath: string) {
  const dialect = new SqliteDialect({
    database: new SQLite(filepath),
  });
  const db = new Kysely<Database>({
    dialect,
  });
  await db.schema
    .createTable("note")
    .ifNotExists()
    .addColumn("id", "text", (cb) => cb.primaryKey())
    .addColumn("entry", "jsonb")
    .execute();
  return db;
}

@injectable()
export class DBLive implements IDB {
  @inject(ConfigType) private config!: IConfig;
  private db: InternalDB | undefined;
  async init() {
    const { cache } = await this.config.getConfig();
    await mkdir(dirname(cache), { recursive: true });
    this.db = await initDb(cache);
  }
  async updateNote(note: INote) {
    const db = this.db;
    if (db === undefined) throw new Error("call init before using db");
    await db.replaceInto("note").values(encode(note)).executeTakeFirst();
  }
  async deleteNote(id: string) {
    const db = this.db;
    if (db === undefined) throw new Error("call init before using db");
    await db.deleteFrom("note").where("id", "=", id).execute();
  }
  async getNotes() {
    const db = this.db;
    if (db === undefined) throw new Error("call init before using db");
    const res = await db.selectFrom("note").select("note").execute();
    return res.map(({ note }) => note);
  }
}
