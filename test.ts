import { walk } from "https://deno.land/std@0.140.0/fs/walk.ts";

// TODO replace with a deno task for "deno test day_*.ts" once deno task supports globs

for await (
  const entry of walk(".", {
    maxDepth: 1,
    includeDirs: false,
    match: [/^day_\d+\.ts$/],
  })
) {
  await import("./" + entry.path);
}
