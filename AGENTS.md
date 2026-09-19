# AGENTS.md

## Project

Interactive weather CLI (Bun + TypeScript). Console menu app that looks up city weather via OpenMeteo; end goal is a compiled standalone binary.

- Greenfield: `index.ts` is still the `bun init` placeholder. No tests, lint, or CI configured yet — don't assume a `npm run`/Node toolchain.
- README and UI are in Portuguese — keep new user-facing text in Portuguese.
- Planned features (per README): default city, add/remove multiple cities, unit settings (°C).
- README's sample menu numbers options 1–5 then jumps to 8 (settings) and 9 (exit); preserve that numbering rather than "fixing" it.

## Commands

Runtime/package manager is Bun:

- Run: `bun index.ts`
- Typecheck only: `bunx tsc` (tsconfig has `noEmit: true`)
- Test: `bun test` (Bun built-in runner)
- Install deps: `bun install`
- Build deliverable binary: `bun build --compile index.ts --outfile weather`

## OpenMeteo (no API key required)

Two-step flow (exact URLs in README):
1. Geocoding API: city name → latitude/longitude
2. Forecast API: latitude/longitude → current temperature

## TypeScript constraints (strict tsconfig)

- `verbatimModuleSyntax`: type-only imports must use `import type`
- `noUncheckedIndexedAccess`: array/index-signature access yields `T | undefined`
- `allowImportingTsExtensions`: relative imports may include the `.ts` extension
- `types: ["bun"]`: Bun globals available; don't add Node-only ambient types
