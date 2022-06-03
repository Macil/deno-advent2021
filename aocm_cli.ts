import {
  Command,
  CompletionsCommand,
  ValidationError,
} from "https://deno.land/x/cliffy@v0.24.2/command/mod.ts";
import { writeAll } from "https://deno.land/std@0.140.0/streams/conversion.ts";
import { basicAuth } from "https://deno.land/x/basic_auth@v1.0.1/mod.ts";
import { getAocm, getDefaultAocm } from "./aocm.ts";

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

function parse(input: string) {
  return input.trimEnd().split("\\n").map(Number);
}

function part1(input: string): number {
  const items = parse(input);
  throw new Error("TODO");
}

function part2(input: string): number {
  const items = parse(input);
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
    await getDefaultAocm().setSessionCookie(value);
  })
  .command("clear-data", "Forget the session cookie and cached inputs")
  .action(async () => {
    await getDefaultAocm().clearData();
  })
  .command("get-input", "View the input for a specific day's challenge")
  .arguments("<year:number> <day:number>")
  .action(async (_options, year, day) => {
    const input = await getDefaultAocm().getInput(year, day);
    await writeAll(Deno.stdout, new TextEncoder().encode(input));
  })
  .command(
    "safe-run",
    "Run a solution script in a safely-sandboxed environment",
  )
  .option("--deno-flags=<flags:string>", "Pass extra flags to Deno")
  .option("-s, --submit", "Submit answers")
  .arguments("<script_arg:string>")
  .action(async (options, scriptArg) => {
    const apiServer = Deno.listen({ port: 0, hostname: "localhost" });
    if (apiServer.addr.transport !== "tcp") {
      throw new Error("Should not happen: wrong transport mode");
    }
    const { addr } = apiServer;

    const password = crypto.randomUUID();

    async function runServer() {
      async function respond(request: Request): Promise<Response> {
        const errResponse = basicAuth(request, "sandbox", {
          sandbox: password,
        });
        if (errResponse) {
          return errResponse;
        }
        const url = new URL(request.url);
        if (url.pathname === "/getInput") {
          const year = Number(url.searchParams.get("year"));
          const day = Number(url.searchParams.get("day"));
          const input = await getAocm().getInput(year, day);
          return new Response(input, {
            headers: {
              "Content-Type": "text/plain",
            },
            status: 200,
          });
        } else {
          return new Response("Not found", { status: 404 });
        }
      }

      async function serveHttp(conn: Deno.Conn) {
        // This "upgrades" a network connection into an HTTP connection.
        const httpConn = Deno.serveHttp(conn);
        // Each request sent over the HTTP connection will be yielded as an async
        // iterator from the HTTP connection.
        for await (const requestEvent of httpConn) {
          requestEvent.respondWith(respond(requestEvent.request));
        }
      }

      for await (const conn of apiServer) {
        serveHttp(conn);
      }
    }

    async function runScript() {
      const apiDomain = `localhost:${addr.port}`;
      const apiAddr = `http://sandbox:${password}@${apiDomain}`;
      const flags = options.denoFlags?.split(" ") || [];
      const p = Deno.run({
        cmd: [
          "deno",
          "run",
          ...flags,
          `--allow-net=${apiDomain}`,
          scriptArg,
          `--aocm-api-addr=${apiAddr}`,
          ...(options.submit ? ["--submit"] : []),
        ],
      });
      const status = await p.status();
      Deno.exit(status.code);
    }

    await Promise.all([runServer(), runScript()]);
  })
  .command("completions", new CompletionsCommand())
  .parse(
    // Work around https://github.com/c4spar/deno-cliffy/issues/387
    Deno.args.length !== 0 ? Deno.args : ["-h"],
  );
