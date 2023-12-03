import {
  assertEquals,
  assertExists,
  assertStrictEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { runPart } from "https://deno.land/x/aocd@v1.5.1/mod.ts";

const ORIGINAL_SEGMENTS_USED_BY_DIGIT: Array<string> = [
  /* 0 */ "abcdefg",
  /* 1 */ "cf",
  /* 2 */ "acdeg",
  /* 3 */ "acdfg",
  /* 4 */ "bcdf",
  /* 5 */ "abdfg",
  /* 6 */ "abdefg",
  /* 7 */ "acf",
  /* 8 */ "abcdefg",
  /* 9 */ "abcdfg",
];

const DIGITS_BY_UNIQUE_LENGTHS = new Map<number, number>(
  [1, 4, 7, 8].map((d) => [ORIGINAL_SEGMENTS_USED_BY_DIGIT[d].length, d]),
);

interface Item {
  digitSegments: Array<string>;
  outputValueSegments: Array<string>;
}

function parse(input: string): Array<Item> {
  return input.trimEnd().split("\n").map((line) => {
    const [digitSegments, outputValueSegments] = line
      .split(" | ")
      .map((p) => p.split(" "));
    return {
      digitSegments,
      outputValueSegments,
    };
  });
}

function part1(input: string): number {
  const items = parse(input);
  // Count how often 1, 4, 7, 8 are used in the output values
  let uniqueDigitCount = 0;
  items.forEach((item) => {
    item.outputValueSegments.forEach((outputValue) => {
      if (DIGITS_BY_UNIQUE_LENGTHS.has(outputValue.length)) {
        uniqueDigitCount++;
      }
    });
  });
  return uniqueDigitCount;
}

function createRandomizedSegmentToDigitMap(
  digitSegments: Array<string>,
): Map<string, number> {
  const sortedDigitSegments = digitSegments.map((segment) =>
    segment.split("").sort().join("")
  );

  const digitToSegments = new Map<number, string>();
  const map = new Map<string, number>();

  function associate(digit: number, segments: string) {
    map.set(segments, digit);
    digitToSegments.set(digit, segments);
  }

  // First detect all digits with unique segment lengths
  for (const segment of sortedDigitSegments) {
    const digit = DIGITS_BY_UNIQUE_LENGTHS.get(segment.length);
    if (digit !== undefined) {
      associate(digit, segment);
      if (map.size === DIGITS_BY_UNIQUE_LENGTHS.size) {
        break;
      }
    }
  }
  assertStrictEquals(map.size, DIGITS_BY_UNIQUE_LENGTHS.size);

  // Detect 3: only 5 length digit with both 1 segments
  const digit1Segments = digitToSegments.get(1)!;
  assertStrictEquals(digit1Segments.length, 2);
  const digit3Segments = sortedDigitSegments.find(
    (segment) =>
      segment.length === 5 &&
      segment.includes(digit1Segments[0]) &&
      segment.includes(digit1Segments[1]),
  );
  assertExists(digit3Segments);
  associate(3, digit3Segments);

  // Detect 2 and 5:
  // They're the remaining 5 length digits.
  // Ignoring segments in common with 1 and each other,
  // 5 has a segment in common with 4 and 2 does not.
  const candidates25 = sortedDigitSegments.filter(
    (segment) => segment.length === 5 && !map.has(segment),
  );
  assertStrictEquals(candidates25.length, 2);
  const candidates25uniqueSegments = candidates25.map((segment, i) => {
    const otherSegment = candidates25[1 - i];
    return segment
      .split("")
      .filter((c) => !digit1Segments.includes(c) && !otherSegment.includes(c))
      .join("");
  });
  const digit4Segments = digitToSegments.get(4)!;
  const digit2Index = candidates25uniqueSegments.findIndex((segment) =>
    !segment.split("").some((c) => digit4Segments.includes(c))
  );
  const digit2Segments = candidates25[digit2Index];
  const digit5Segments = candidates25[1 - digit2Index];
  associate(2, digit2Segments);
  associate(5, digit5Segments);

  // We have 1, 2, 3, 4, 5, 7, 8.
  // We still need to detect 0, 6, and 9.

  // Detect 6: only 6 length digit with only 1 segment in common with 1.
  const digit6Segments = sortedDigitSegments.find(
    (segment) =>
      segment.length === 6 &&
      segment.split("").filter((c) => digit1Segments.includes(c)).length === 1,
  );
  assertExists(digit6Segments);
  associate(6, digit6Segments);

  // Detect 0 and 9:
  // 0 has 3 segments in common with 4,
  // 9 has 4 segments in common with 4.
  const digit0Segments = sortedDigitSegments.find(
    (segment) =>
      segment.length === 6 &&
      segment !== digit6Segments &&
      segment.split("").filter((c) => digit4Segments.includes(c)).length === 3,
  );
  assertExists(digit0Segments);
  associate(0, digit0Segments);

  const digit9Segments = sortedDigitSegments.find(
    (segment) =>
      segment.length === 6 &&
      segment !== digit6Segments &&
      segment !== digit0Segments,
  );
  assertExists(digit9Segments);
  associate(9, digit9Segments);

  assertStrictEquals(map.size, 10);

  return map;
}

function getOutputValueForEntry(item: Item): number {
  const map = createRandomizedSegmentToDigitMap(item.digitSegments);
  const outputValueDigits = item.outputValueSegments.map((segments) => {
    const sortedSegments = segments.split("").sort().join("");
    const digit = map.get(sortedSegments);
    if (digit === undefined) {
      throw new Error(`No digit found for segments "${segments}"`);
    }
    return digit;
  });
  return outputValueDigits.reduce((value, digit) => value * 10 + digit);
}

function part2(input: string): number {
  const items = parse(input);
  const outputValues = items.map(getOutputValueForEntry);
  const sum = outputValues.reduce((sum, value) => sum + value, 0);
  return sum;
}

if (import.meta.main) {
  runPart(2021, 8, 1, part1);
  runPart(2021, 8, 2, part2);
}

const TEST_INPUT = `\
be cfbegad cbdgef fgaecd cgeb fdcge agebfd fecdb fabcd edb | fdgacbe cefdb cefbgd gcbe
edbfga begcd cbg gc gcadebf fbgde acbgfd abcde gfcbed gfec | fcgedb cgb dgebacf gc
fgaebd cg bdaec gdafb agbcfd gdcbef bgcad gfac gcb cdgabef | cg cg fdcagb cbg
fbegcd cbd adcefb dageb afcb bc aefdc ecdab fgdeca fcdbega | efabcd cedba gadfec cb
aecbfdg fbg gf bafeg dbefa fcge gcbea fcaegb dgceab fcbdga | gecf egdcabf bgf bfgea
fgeab ca afcebg bdacfeg cfaedg gcfdb baec bfadeg bafgc acf | gebdcfa ecba ca fadegcb
dbcfg fgd bdegcaf fgec aegbdf ecdfab fbedc dacgb gdcebf gf | cefg dcbef fcge gbcadfe
bdfegc cbegaf gecbf dfcage bdacg ed bedf ced adcbefg gebcd | ed bcgafe cdgba cbgef
egadfb cdbfeg cegd fecab cgb gbdefca cg fgcdab egfdb bfceg | gbdfcae bgc cg cgb
gcafb gcf dcaebfg ecagb gf abcdeg gaef cafbge fdbac fegbdc | fgae cfgab fg bagce
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 26);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 61229);
});
