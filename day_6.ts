import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { runPart } from "https://deno.land/x/aocd@v1.3.0/mod.ts";

function parse(input: string): Map<number, number> {
  const lanternFishByDaysUntilReproduction = new Map<number, number>();
  input.trimEnd().split(",").map(Number)
    .forEach((daysUntilReproduction) => {
      const amount =
        lanternFishByDaysUntilReproduction.get(daysUntilReproduction) ?? 0;
      lanternFishByDaysUntilReproduction.set(daysUntilReproduction, amount + 1);
    });
  return lanternFishByDaysUntilReproduction;
}

function lanternFishCountAfterDays(
  lanternFishByDaysUntilReproduction: Map<number, number>,
  days: number,
): number {
  for (let day = 0; day < days; day++) {
    const newLanternFishByDaysUntilReproduction = new Map<number, number>();
    for (
      const [daysUntilReproduction, amount]
        of lanternFishByDaysUntilReproduction
    ) {
      if (daysUntilReproduction === 0) {
        newLanternFishByDaysUntilReproduction.set(8, amount);
        newLanternFishByDaysUntilReproduction.set(
          6,
          amount + (newLanternFishByDaysUntilReproduction.get(6) ?? 0),
        );
      } else {
        newLanternFishByDaysUntilReproduction.set(
          daysUntilReproduction - 1,
          amount +
            (newLanternFishByDaysUntilReproduction.get(
              daysUntilReproduction - 1,
            ) ?? 0),
        );
      }
    }
    lanternFishByDaysUntilReproduction = newLanternFishByDaysUntilReproduction;
  }
  const totalLanternFish = Array.from(
    lanternFishByDaysUntilReproduction.values(),
  ).reduce((sum, amount) => sum + amount, 0);
  return totalLanternFish;
}

function part1(input: string): number {
  const lanternFishByDaysUntilReproduction = parse(input);
  return lanternFishCountAfterDays(lanternFishByDaysUntilReproduction, 80);
}

function part2(input: string): number {
  const lanternFishByDaysUntilReproduction = parse(input);
  return lanternFishCountAfterDays(lanternFishByDaysUntilReproduction, 256);
}

if (import.meta.main) {
  runPart(2021, 6, 1, part1);
  runPart(2021, 6, 2, part2);
}

const TEST_INPUT = `\
3,4,3,1,2
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 5934);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 26984457539);
});
