# nisect

Track down which version of a package introduced a bug.

> (Next.js + bisect = nisect. Name pending...)

Inspired by [`vercel bisect`](https://vercel.com/docs/cli/bisect).

## Installation

```sh
pnpm i -g @balazsorban/nisect
```

## Usage

Use it in a Next.js repository.

```
Usage: nisect [options]

Options:
  -D, --dev            run 'next dev' (default: true)
  -P, --production     run 'next build && next start'
  --per-page <number>  number of last releases to search in (default: "100")
  -h, --help           display help for command
```

## Todo

- Make it work with other package managers (hardcoded to `pnpm`)
- Make it work with other packages (hardcoded to `next`)
- Let the user pass a custom command to run (currently `next dev` or `next build && next start`)