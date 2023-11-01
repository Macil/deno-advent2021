import { chunk } from "https://deno.land/std@0.204.0/collections/chunk.ts";
import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { runPart } from "https://deno.land/x/aocd@v1.4.3/mod.ts";

interface Match {
  draws: number[];
  boards: Board[];
}

interface Board {
  // 5x5 grid, row first
  grid: number[][];
}

function parse(input: string): Match {
  const lines = input.trimEnd().split("\n");
  const draws = lines[0].split(",").map(Number);
  const boardChunks = chunk(lines.slice(1), 6).map((lines) => lines.slice(1));
  return {
    draws,
    boards: boardChunks.map((lines) => ({
      grid: lines.map((line) => line.trim().split(/\s+/).map(Number)),
    })),
  };
}

/** ignores diagonals */
function isBoardSolvedNow(
  board: Board,
  drawnNumbers: Set<number>,
  newestDraw: number,
): boolean {
  // find row containing newestDraw
  const y = board.grid.findIndex((row) => row.includes(newestDraw));
  if (y !== -1) {
    if (board.grid[y].every((n) => drawnNumbers.has(n))) {
      return true;
    }
    const x = board.grid[y].indexOf(newestDraw);
    if (board.grid.every((row) => drawnNumbers.has(row[x]))) {
      return true;
    }
  }
  return false;
}

function sumOfUnmarkedNumbers(board: Board, drawnNumbers: Set<number>): number {
  let sum = 0;
  for (const row of board.grid) {
    for (const n of row) {
      if (!drawnNumbers.has(n)) {
        sum += n;
      }
    }
  }
  return sum;
}

function part1(input: string): number {
  const match = parse(input);
  const drawnNumbers = new Set<number>();
  for (const draw of match.draws) {
    drawnNumbers.add(draw);
    if (drawnNumbers.size >= 5) {
      for (const board of match.boards) {
        if (isBoardSolvedNow(board, drawnNumbers, draw)) {
          return sumOfUnmarkedNumbers(board, drawnNumbers) * draw;
        }
      }
    }
  }
  throw new Error("no winner");
}

function part2(input: string): number {
  const match = parse(input);
  const drawnNumbers = new Set<number>();
  const unfinishedBoards = new Set<Board>(match.boards);
  for (const draw of match.draws) {
    drawnNumbers.add(draw);
    if (drawnNumbers.size >= 5) {
      for (const board of unfinishedBoards) {
        if (isBoardSolvedNow(board, drawnNumbers, draw)) {
          unfinishedBoards.delete(board);
          if (unfinishedBoards.size === 0) {
            return sumOfUnmarkedNumbers(board, drawnNumbers) * draw;
          }
        }
      }
    }
  }
  throw new Error("no winner");
}

if (import.meta.main) {
  runPart(2021, 4, 1, part1);
  runPart(2021, 4, 2, part2);
}

const TEST_INPUT = `\
7,4,9,5,11,17,23,2,0,14,21,24,10,16,13,6,15,25,12,22,18,20,8,19,3,26,1

22 13 17 11  0
 8  2 23  4 24
21  9 14 16  7
 6 10  3 18  5
 1 12 20 15 19

 3 15  0  2 22
 9 18 13 17  5
19  8  7 25 23
20 11 10 24  4
14 21 16 12  6

14 21 17 24  4
10 16 15  9 19
18  8 23 26 20
22 11 13  6  5
 2  0 12  3  7
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 4512);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 1924);
});
