import {
  Command,
  CompletionsCommand,
} from "https://deno.land/x/cliffy@v0.24.2/command/mod.ts";
import { writeAll } from "https://deno.land/std@0.140.0/streams/conversion.ts";
import { getAocm } from "./aocm.ts";

await new Command()
  .name("aocm")
  .description("Helper tool for solving Advent of Code with Deno")
  .version("0.1.0")
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
  .parse(Deno.args);
