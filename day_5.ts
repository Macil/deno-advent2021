import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { runPart } from "https://deno.land/x/aocd@v1.5.1/mod.ts";

interface Coordinate {
  x: number;
  y: number;
}

interface Line {
  start: Coordinate;
  end: Coordinate;
}

function parseCoordinate(coordinate: string): Coordinate {
  const [x, y] = coordinate.split(",").map(Number);
  return { x, y };
}

function coordinateToString(coordinate: Coordinate): string {
  return `${coordinate.x},${coordinate.y}`;
}

function isLineDiagonal(line: Line): boolean {
  return line.start.x !== line.end.x && line.start.y !== line.end.y;
}

function* pointsAlongLine(line: Line): Generator<Coordinate> {
  const dx = line.end.x - line.start.x;
  const dy = line.end.y - line.start.y;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  for (let i = 0; i <= steps; i++) {
    yield {
      x: line.start.x + Math.round((dx / steps) * i),
      y: line.start.y + Math.round((dy / steps) * i),
    };
  }
}

function parse(input: string): Line[] {
  return input.trimEnd().split("\n").map((line) => {
    const [start, end] = line.split(" -> ").map(parseCoordinate);
    return { start, end };
  });
}

function part1(input: string): number {
  const vents = parse(input);
  const hitAmountsPerCoordinate = new Map<string, number>();
  for (const vent of vents) {
    if (!isLineDiagonal(vent)) {
      for (const point of pointsAlongLine(vent)) {
        const key = coordinateToString(point);
        const hitAmount = hitAmountsPerCoordinate.get(key) ?? 0;
        hitAmountsPerCoordinate.set(key, hitAmount + 1);
      }
    }
  }
  return Array.from(hitAmountsPerCoordinate.values())
    .filter((amount) => amount >= 2)
    .length;
}

function part2(input: string): number {
  const vents = parse(input);
  const hitAmountsPerCoordinate = new Map<string, number>();
  for (const vent of vents) {
    for (const point of pointsAlongLine(vent)) {
      const key = coordinateToString(point);
      const hitAmount = hitAmountsPerCoordinate.get(key) ?? 0;
      hitAmountsPerCoordinate.set(key, hitAmount + 1);
    }
  }
  return Array.from(hitAmountsPerCoordinate.values())
    .filter((amount) => amount >= 2)
    .length;
}

if (import.meta.main) {
  runPart(2021, 5, 1, part1);
  runPart(2021, 5, 2, part2);
}

const TEST_INPUT = `\
0,9 -> 5,9
8,0 -> 0,8
9,4 -> 3,4
2,2 -> 2,1
7,0 -> 7,4
6,4 -> 2,0
0,9 -> 2,9
3,4 -> 1,4
0,0 -> 8,8
5,5 -> 8,2
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 5);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 12);
});
