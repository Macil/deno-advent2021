import {
  Command,
  CompletionsCommand,
  ValidationError,
} from "https://deno.land/x/cliffy@v0.24.2/command/mod.ts";
import { writeAll } from "https://deno.land/std@0.140.0/streams/conversion.ts";
import { getAocm } from "./aocm.ts";

await new Command()
  .name("aocm")
  .description("Helper tool for solving Advent of Code with Deno")
  .version("0.1.0")
  .action(() => {
    throw new ValidationError("A command is required");
  })
  .command(
    "init",
    "Initialize a project directory",
  )
  .arguments("<year:number>")
  .action(() => {
    throw new Error("Not implemented yet"); // TODO
  })
  .command(
    "start",
    "Create a script from a template for solving a day's challenge",
  )
  .arguments("<day:number>")
  .action(async (_options, day) => {
    const config = JSON.parse(await Deno.readTextFile(".aocmrc.json"));
    const year = config.year;
    if (typeof year !== "number") {
      throw new Error("Invalid year in config .aocmrc.json");
    }
    const src =
      `import { assertEquals } from "https://deno.land/std@0.141.0/testing/asserts.ts";
import { runPart } from "./aocm.ts";

function part1(input: string): number {
  const numbers = input.trimEnd().split("\\n").map(Number);
  throw new Error("TODO");
}

function part2(input: string): number {
  const numbers = input.trimEnd().split("\\n").map(Number);
  throw new Error("TODO");
}

if (import.meta.main) {
  runPart(${year}, ${day}, 1, part1);
  runPart(${year}, ${day}, 2, part2);
}

const TEST_INPUT = \`
6
7
8
9
10
\`.slice(1);

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 11);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 12);
});
`;
    const newFile = await Deno.open(`day_${day}.ts`, {
      write: true,
      createNew: true,
    });
    try {
      await writeAll(newFile, new TextEncoder().encode(src));
    } finally {
      newFile.close();
    }
  })
  .command(
    "set-cookie",
    "Set the Advent of Code session cookie for later calls",
  )
  .arguments("<value:string>")
  .action(async (_options, value) => {
    await getAocm().setSessionCookie(value);
  })
  .command("clear-data", "Forget the session cookie and cached inputs")
  .action(() => {
    throw new Error("Not implemented yet"); // TODO
  })
  .command("get-input", "View the input for a specific day's challenge")
  .arguments("<year:number> <day:number>")
  .action(async (_options, year, day) => {
    const input = await getAocm().getInput(year, day);
    await writeAll(Deno.stdout, new TextEncoder().encode(input));
  })
  .command(
    "safe-run",
    "Run a solution script in a safely-sandboxed environment",
  )
  .option("--deno-flags=<flags:string>", "Pass extra flags to Deno")
  .arguments("<script_arg:string>")
  .action((_options, _scriptArg) => {
    throw new Error("Not implemented yet"); // TODO
  })
  .command("completions", new CompletionsCommand())
  .parse(
    // Work around https://github.com/c4spar/deno-cliffy/issues/387
    Deno.args.length !== 0 ? Deno.args : ["-h"],
  );
