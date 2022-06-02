import { walk } from "https://deno.land/std@0.141.0/fs/walk.ts";

// Run all of the tests in day_*.ts files. This works around the fact that
// `deno test` by default only runs tests in files named like *test.ts.

const tasks = [];
for await (
  const entry of walk(".", {
    maxDepth: 1,
    includeDirs: false,
    match: [/^day_\d+\.ts$/],
  })
) {
  tasks.push(import("./" + entry.path));
}
await Promise.all(tasks);
