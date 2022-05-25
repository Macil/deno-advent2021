# deno-advent2021

This is a partial set of solutions to
[Advent of Code](https://adventofcode.com/) 2021, using Deno and Typescript.

## Usage

First you need to load your Advent of Code session cookie.
[You need to get this value from your browser](https://github.com/wimglenn/advent-of-code-wim/issues/1)
after logging into Advent of code.

```
deno run -A aocm_cli.ts set-cookie 123_COOKIE_VALUE_HERE
```

Then you can run any day's challenge to see the answer:

```
deno run -A day_1.ts
```

You can run all tests with `deno task test`, or you can run an individual test
by clicking the play button next to it inside of Visual Studio Code.
