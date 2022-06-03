import { parse } from "https://deno.land/std@0.140.0/flags/mod.ts";

import { DefaultAocm } from "./_DefaultAocm.ts";
export { DefaultAocm } from "./_DefaultAocm.ts";
import { Aocm, Solver } from "./_common.ts";
import { SafeRunAocm } from "./_SafeRunAocm.ts";
export * from "./_common.ts";

let singleton: Aocm | undefined;

export function getAocm(): Aocm {
  if (!singleton) {
    const parsedArgs = parse(Deno.args, {
      boolean: ["s", "submit"],
      string: ["aocm-api-addr"],
    });
    const submit = Boolean(parsedArgs.s || parsedArgs.submit);
    if (parsedArgs["aocm-api-addr"]) {
      singleton = new SafeRunAocm({ submit }, parsedArgs["aocm-api-addr"]);
    } else {
      singleton = new DefaultAocm({ submit });
    }
  }
  return singleton;
}

export function getDefaultAocm(): DefaultAocm {
  const aocm = getAocm();
  if (aocm instanceof DefaultAocm) {
    return aocm;
  } else {
    throw new Error("getDefaultAocm() is disallowed inside safe-run");
  }
}

export function runPart(
  year: number,
  day: number,
  part: number,
  solver: Solver,
) {
  return getAocm().runPart(year, day, part, solver);
}
