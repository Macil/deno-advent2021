import { parse } from "https://deno.land/std@0.140.0/flags/mod.ts";
import { memoizy } from "https://deno.land/x/memoizy@1.0.0/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v3.4.0/mod.ts";
import cacheDir from "https://deno.land/x/cache_dir@v0.1.1/mod.ts";

type Answer = string | number;

export type Solver = (input: string) => Answer | Promise<Answer>;

interface Config {
  run: boolean;
  submit: boolean;
  concurrency: boolean;
  resultsInOrder: boolean;
}

let config: Config | undefined;
const defaultConfig: Config = {
  run: false,
  submit: false,
  concurrency: false,
  resultsInOrder: true,
};

export function initFromArgs() {
  // TODO add --help argument support
  // TODO error on unknown arguments
  const parsedArgs = parse(Deno.args, { boolean: ["r", "run", "s", "submit"] });
  const submit = Boolean(parsedArgs.s || parsedArgs.submit);
  const run = Boolean(parsedArgs.r || parsedArgs.run);
  config = { ...defaultConfig, run, submit };
}

export function init(config_: Partial<Config>) {
  config = { ...defaultConfig, ...config_ };
}

let tasksComplete = Promise.resolve();

const getSessionCookie = memoizy((): string => {
  const AOC_SESSION = Deno.env.get("AOC_SESSION");
  if (!AOC_SESSION) {
    throw new Error("Could not find Advent of Code session cookie");
  }
  return AOC_SESSION;
});

const getDb = memoizy(async () => {
  const dbDir = cacheDir() + "/aocm";
  await Deno.mkdir(dbDir, { recursive: true });
  const db = new DB(dbDir + "/test.db");
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

async function fetchInput(year: number, day: number): Promise<string> {
  console.log("fetching from network...", year, day);
  const AOC_SESSION = getSessionCookie();
  const req = await fetch(
    `https://adventofcode.com/${year}/day/${day}/input`,
    { headers: { Cookie: `session=${AOC_SESSION}` } },
  );
  if (!req.ok) {
    throw new Error(`Bad response: ${req.status}`);
  }
  return req.text();
}

export const getInput = memoizy(
  async (year: number, day: number): Promise<string> => {
    const db = await getDb();
    const cachedResults = db.query<[string]>(
      "SELECT input FROM inputs WHERE year = ? AND day = ?",
      [year, day],
    );
    if (cachedResults[0]) {
      return cachedResults[0][0];
    }

    const input = await fetchInput(year, day);
    db.query("INSERT INTO inputs (year, day, input) VALUES (?, ?, ?)", [
      year,
      day,
      input,
    ]);
    return input;
  },
);

export async function solver(
  year: number,
  day: number,
  part: number,
  solver: Solver,
): Promise<void> {
  if (!config) {
    initFromArgs();
  }
  const config_ = config!;
  if (config_.run || config_.submit) {
    const inputPromise = getInput(year, day);
    let runAndGetResultShower = async (): Promise<() => void> => {
      const input = await inputPromise;
      const answer = await solver(input);

      return () => {
        console.log(`${year} Day ${day} Part ${part}: ${answer}`);
      };
    };

    if (config_.concurrency && !config_.resultsInOrder) {
      const showResult = await runAndGetResultShower();
      showResult();
    } else {
      if (config_.resultsInOrder) {
        const showResultPromise = runAndGetResultShower();
        runAndGetResultShower = () => showResultPromise;
      }
      tasksComplete = tasksComplete.then(async () => {
        const showResult = await runAndGetResultShower();
        showResult();
      });
      await tasksComplete;
    }
  }
}
