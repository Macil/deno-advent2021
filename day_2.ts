import { assertEquals } from "https://deno.land/std@0.141.0/testing/asserts.ts";
import { runPart } from "./aocm.ts";

function parse(input: string) {
  return input.trimEnd().split("\n").map((cmd) => {
    const [direction, offset] = cmd.split(" ");
    return { direction, offset: Number(offset) };
  });
}

function part1(input: string): number {
  const items = parse(input);
  let hPos = 0;
  let depth = 0;
  for (const item of items) {
    switch (item.direction) {
      case "forward":
        hPos += item.offset;
        break;
      case "up":
        depth -= item.offset;
        break;
      case "down":
        depth += item.offset;
        break;
      default:
        throw new Error(`Unknown direction: ${item.direction}`);
    }
  }
  return hPos * depth;
}

function part2(input: string): number {
  const items = parse(input);
  let hPos = 0;
  let depth = 0;
  let aim = 0;
  for (const item of items) {
    switch (item.direction) {
      case "forward":
        hPos += item.offset;
        depth += aim * item.offset;
        break;
      case "up":
        aim -= item.offset;
        break;
      case "down":
        aim += item.offset;
        break;
      default:
        throw new Error(`Unknown direction: ${item.direction}`);
    }
  }
  return hPos * depth;
}

if (import.meta.main) {
  runPart(2021, 2, 1, part1);
  runPart(2021, 2, 2, part2);
}

const TEST_INPUT = `
forward 5
down 5
forward 8
up 3
down 8
forward 2
`.slice(1);

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 150);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 900);
});
