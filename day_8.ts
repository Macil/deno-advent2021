import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { runPart } from "https://deno.land/x/aocd@v1.4.3/mod.ts";

const SECTIONS_USED_BY_DIGIT: Array<string> = [
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

interface Item {
  digitSections: Array<string>;
  outputValues: Array<string>;
}

function parse(input: string): Array<Item> {
  return input.trimEnd().split("\n").map((line) => {
    const [digitSections, outputValues] = line
      .split(" | ")
      .map((p) => p.split(" "));
    return {
      digitSections,
      outputValues,
    };
  });
}

function part1(input: string): number {
  const items = parse(input);
  // Count how often 1, 4, 7, 8 are used in the output values
  const uniqueDigitLengths = [1, 4, 7, 8].map((d) =>
    SECTIONS_USED_BY_DIGIT[d].length
  );
  let uniqueDigitCount = 0;
  items.forEach((item) => {
    item.outputValues.forEach((outputValue) => {
      if (uniqueDigitLengths.includes(outputValue.length)) {
        uniqueDigitCount++;
      }
    });
  });
  return uniqueDigitCount;
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2021, 8, 1, part1);
  // runPart(2021, 8, 2, part2);
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

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
