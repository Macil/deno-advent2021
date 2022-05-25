import { parse } from "https://deno.land/std@0.140.0/flags/mod.ts";
import { memoizy } from "https://deno.land/x/memoizy@1.0.0/mod.ts";

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

export const fetchInput: (year: number, day: number) => Promise<string> =
  memoizy(async (year: number, day: number) => {
    const AOC_SESSION = getSessionCookie();
    const req = await fetch(
      `https://adventofcode.com/${year}/day/${day}/input`,
      { headers: { Cookie: `session=${AOC_SESSION}` } },
    );
    if (!req.ok) {
      throw new Error(`Bad response: ${req.status}`);
    }
    return req.text();
  });

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
    const inputPromise = fetchInput(year, day);
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
