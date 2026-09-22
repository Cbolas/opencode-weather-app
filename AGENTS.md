# AGENTS.md

## Project

Interactive weather CLI (Bun + TypeScript). Console menu app that looks up city weather via OpenMeteo; end goal is a compiled standalone binary.

- Source lives in `src/` with a layered structure (actions, presentation, storage, types, api, utils) matching `references/file-system.md` — keep new files in the right layer.
- README and UI are in Portuguese — keep new user-facing text in Portuguese.
- Runtime state is stored in `cities.json` and `settings.json` (project root, gitignored); a legacy `weather.json` is migrated automatically on first run.
- Menu numbers options 1–7, then 8 (settings) and 9 (exit); keep 8/9 in place when adding new options.
- No lint or CI configured; tests use Bun's built-in runner — don't assume an `npm run`/Node toolchain.

## Commands

Runtime/package manager is Bun:

- Run: `bun src/index.ts`
- Typecheck only: `bun x tsc` (tsconfig has `noEmit: true`; use `bun x` — `bunx` may not be on PATH)
- Test: `bun test` (Bun built-in runner)
- Install deps: `bun install`
- Build deliverable binary: `bun build --compile src/index.ts --outfile weather`

## OpenMeteo (no API key required)

Two-step flow (exact URLs in README):
1. Geocoding API: city name → latitude/longitude
2. Forecast API: latitude/longitude → current temperature

## TypeScript constraints (strict tsconfig)

- `verbatimModuleSyntax`: type-only imports must use `import type`
- `noUncheckedIndexedAccess`: array/index-signature access yields `T | undefined`
- `allowImportingTsExtensions`: relative imports may include the `.ts` extension
- `types: ["bun"]`: Bun globals available; don't add Node-only ambient types
