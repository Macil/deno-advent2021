import { getAocm } from "./aocm.ts";

if (Deno.args.length !== 2 || Deno.args[0] !== "set-cookie") {
  console.error("Usage: ... set-cookie SESSION");
  Deno.exit(1);
}

const aocm = getAocm();
aocm.setSessionCookie(Deno.args[1]);
