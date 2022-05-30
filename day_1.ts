import { assertEquals } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import { runPart } from "./aocm.ts";

function part1(input: string) {
  const numbers = input.trimEnd().split("\n").map(Number);
  let count = 0;
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] > numbers[i - 1]) {
      count++;
    }
  }
  return count;
}

function part2(input: string) {
  const numbers = input.trimEnd().split("\n").map(Number);
  let count = 0;
  for (let i = 3; i < numbers.length; i++) {
    const first = numbers[i - 3] + numbers[i - 2] + numbers[i - 1];
    const second = numbers[i - 2] + numbers[i - 1] + numbers[i];
    if (second > first) {
      count++;
    }
  }
  return count;
}

if (import.meta.main) {
  runPart(2021, 1, 1, part1);
  runPart(2021, 1, 2, part2);
}

const TEST_INPUT = `
199
200
208
210
200
207
240
269
260
263
`.slice(1);

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 7);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 5);
});
