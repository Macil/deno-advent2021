import { DB } from "https://deno.land/x/sqlite@v3.4.0/mod.ts";
import cacheDir from "https://deno.land/x/dir@1.4.0/cache_dir/mod.ts";
import dataDir from "https://deno.land/x/dir@1.4.0/data_dir/mod.ts";
import { memoizy } from "https://deno.land/x/memoizy@1.0.0/mod.ts";

export class DbManager {
  readonly getMainDb = memoizy(async () => {
    const dataDir_ = dataDir();
    if (!dataDir_) throw new Error("Could not find data directory");
    const dbDir = dataDir_ + "/aocm";
    await Deno.mkdir(dbDir, { recursive: true });
    const db = new DB(dbDir + "/main.db");
    db.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session TEXT NOT NULL
      )
    `);
    return db;
  });

  readonly getCacheDb = memoizy(async () => {
    const cacheDir_ = cacheDir();
    if (!cacheDir_) throw new Error("Could not find cache directory");
    const dbDir = cacheDir_ + "/aocm";
    await Deno.mkdir(dbDir, { recursive: true });
    const db = new DB(dbDir + "/cache.db");
    db.query(`
      CREATE TABLE IF NOT EXISTS inputs (
        year INTEGER NOT NULL,
        day INTEGER NOT NULL,
        input TEXT,
        PRIMARY KEY (year, day)
      )
    `);
    return db;
  });
}
