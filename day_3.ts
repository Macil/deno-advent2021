import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { runPart } from "https://deno.land/x/aocd@v1.3.0/mod.ts";

function parse(input: string) {
  return input.trimEnd().split("\n");
}

function part1(input: string): number {
  const items = parse(input);

  const onesPerIndex = new Map<number, number>();
  for (const item of items) {
    for (let i = 0; i < item.length; i++) {
      if (item[i] === "1") {
        const bitIndex = item.length - i - 1;
        onesPerIndex.set(bitIndex, (onesPerIndex.get(bitIndex) ?? 0) + 1);
      }
    }
  }
  let gamma = 0;
  let epsilon = 0;
  for (const [index, count] of onesPerIndex) {
    if (count > items.length / 2) {
      gamma |= 1 << index;
    } else {
      epsilon |= 1 << index;
    }
  }
  return gamma * epsilon;
}

function part2(input: string): number {
  const items = parse(input);

  function calculateMostCommonBitAtIndex(
    candidates: string[],
    index: number,
  ): 0 | 1 {
    const ones = candidates.reduce((ones, item) => {
      if (item[index] === "1") {
        return ones + 1;
      }
      return ones;
    }, 0);
    const zeros = candidates.length - ones;
    return ones >= zeros ? 1 : 0;
  }

  function calculateRating(useMostCommon: boolean): number {
    const bitCount = items[0].length;
    let candidates = items;
    for (let i = 0; i < bitCount && candidates.length > 1; i++) {
      const mostCommonBit = calculateMostCommonBitAtIndex(candidates, i);
      const checkChar = useMostCommon
        ? String(mostCommonBit)
        : String(1 - mostCommonBit);
      candidates = candidates.filter((item) => item[i] === checkChar);
    }
    if (candidates.length !== 1) {
      throw new Error(`Expected 1 candidate, got ${candidates.length}`);
    }
    return parseInt(candidates[0], 2);
  }

  const oxygenGeneratorRating = calculateRating(true);
  const co2ScrubberRating = calculateRating(false);
  const lifeSupportRating = oxygenGeneratorRating * co2ScrubberRating;
  return lifeSupportRating;
}

if (import.meta.main) {
  runPart(2021, 3, 1, part1);
  runPart(2021, 3, 2, part2);
}

const TEST_INPUT = `\
00100
11110
10110
10111
10101
01111
00111
11100
10000
11001
00010
01010
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 198);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 230);
});
