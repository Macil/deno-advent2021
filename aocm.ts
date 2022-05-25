import { parse } from "https://deno.land/std@0.140.0/flags/mod.ts";
import { memoizy } from "https://deno.land/x/memoizy@1.0.0/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v3.4.0/mod.ts";
import cacheDir from "https://deno.land/x/cache_dir@v0.1.1/mod.ts";

export type Answer = string | number;

export type Solver = (input: string) => Answer | Promise<Answer>;

export interface Config {
  submit: boolean;
  concurrency: boolean;
  resultsInOrder: boolean;
}

const defaultConfig: Config = {
  submit: false,
  concurrency: false,
  resultsInOrder: true,
};

let singleton: Aocm | undefined;

export function getAocm(): Aocm {
  if (!singleton) {
    const parsedArgs = parse(Deno.args, {
      boolean: ["s", "submit"],
    });
    singleton = new Aocm({
      submit: Boolean(parsedArgs.s || parsedArgs.submit),
    });
  }
  return singleton;
}

export function runPart(
  year: number,
  day: number,
  part: number,
  solver: Solver,
) {
  return getAocm().runPart(year, day, part, solver);
}

export class Aocm {
  private config: Config;
  private tasksComplete = Promise.resolve();

  constructor(config: Partial<Config>) {
    this.config = { ...defaultConfig, ...config };
  }

  async runPart(
    year: number,
    day: number,
    part: number,
    solver: Solver,
  ): Promise<void> {
    if (this.config.submit) {
      // TODO
      console.warn("Answer submitting is not implemented yet");
    }
    const inputPromise = this.getInput(year, day);
    let runAndGetResultShower = async (): Promise<() => void> => {
      const input = await inputPromise;
      const answer = await solver(input);

      return () => {
        console.log(`${year} Day ${day} Part ${part}: ${answer}`);
      };
    };

    if (this.config.concurrency && !this.config.resultsInOrder) {
      const showResult = await runAndGetResultShower();
      showResult();
    } else {
      if (this.config.resultsInOrder) {
        const showResultPromise = runAndGetResultShower();
        runAndGetResultShower = () => showResultPromise;
      }
      this.tasksComplete = this.tasksComplete.then(async () => {
        const showResult = await runAndGetResultShower();
        showResult();
      });
      await this.tasksComplete;
    }
  }

  private readonly getSessionCookie = memoizy(async (): Promise<string> => {
    const AOC_SESSION = Deno.env.get("AOC_SESSION");
    if (AOC_SESSION) {
      return AOC_SESSION;
    }
    const db = await this.getDb();
    const results = db.query<[string]>("SELECT session FROM sessions LIMIT 1");
    if (results[0]) {
      return results[0][0];
    }
    throw new Error("Could not find Advent of Code session cookie");
  });

  async setSessionCookie(session: string) {
    const db = await this.getDb();
    db.transaction(() => {
      db.query("INSERT INTO sessions (session) VALUES (?)", [
        session,
      ]);
      const sessionId = db.lastInsertRowId;
      db.query("DELETE FROM sessions WHERE id != ?", [sessionId]);
    });
  }

  private readonly getDb = memoizy(async () => {
    const dbDir = cacheDir() + "/aocm";
    await Deno.mkdir(dbDir, { recursive: true });
    const db = new DB(dbDir + "/main.db");
    db.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session TEXT NOT NULL
      )
    `);
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

  private async fetchInput(year: number, day: number): Promise<string> {
    const url = `https://adventofcode.com/${year}/day/${day}/input`;
    console.warn(`Fetching ${url}`);
    const AOC_SESSION = await this.getSessionCookie();
    const req = await fetch(
      url,
      { headers: { Cookie: `session=${AOC_SESSION}` } },
    );
    if (!req.ok) {
      throw new Error(`Bad response: ${req.status}`);
    }
    return req.text();
  }

  readonly getInput = memoizy(
    async (year: number, day: number): Promise<string> => {
      const db = await this.getDb();
      const cachedResults = db.query<[string]>(
        "SELECT input FROM inputs WHERE year = ? AND day = ?",
        [year, day],
      );
      if (cachedResults[0]) {
        return cachedResults[0][0];
      }

      const input = await this.fetchInput(year, day);
      db.query("INSERT INTO inputs (year, day, input) VALUES (?, ?, ?)", [
        year,
        day,
        input,
      ]);
      return input;
    },
  );
}
