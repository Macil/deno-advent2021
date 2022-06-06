# deno-advent2021

This project contains solutions to [Advent of Code](https://adventofcode.com/)
2021, using [Deno](https://deno.land/) and Typescript.

## Usage

You must have [aocd](https://github.com/Macil/aocd) installed and have set your
session cookie with it:

```
aocd set-cookie COOKIE_VALUE_HERE
```

Then you can run any solution script:

```
deno run -A day_1.ts
```

You can start a new day's challenge with this command:

```
aocd start 2
```

You can run one day's tests with `deno test day_1.ts` or by clicking the play
button next to it inside of Visual Studio Code. You can run all days' tests with
`deno task test`.
