# AGENTS.md

SLIB backend — NestJS 11 + Prisma 7 (PostgreSQL) API for a Spanish-language library system (loans, requests, fines, suspensions, incidents, notifications). Domain vocabulary, comments, and Prisma enum values are in Spanish; code identifiers are English.

`README.md` is the **untouched NestJS starter boilerplate** — it is not project documentation. Ignore it.

## Commands

| Task | Command | Status |
|---|---|---|
| Dev server | `pnpm start:dev` | **exits immediately** — see *Env files never resolve* |
| Build | `pnpm build` | works |
| Typecheck | `pnpm exec tsc --noEmit` | no `typecheck` script exists; this is it |
| Lint | `pnpm lint` | works, but see warning below |
| Unit tests | `pnpm test` | **broken** — see below |
| E2E tests | `pnpm test:e2e` | untested; same Jest/ESM problem |
| Prisma | `pnpm exec prisma validate \| generate \| migrate dev` | works, but `migrate` needs a resolvable `DATABASE_URL` |

- **`pnpm lint` rewrites your files.** `--fix` is baked into the script. For a read-only check use `pnpm exec eslint "{src,test}/**/*.ts"`.
- The script also globs `apps/` and `libs/`, which don't exist here.

## ESM: relative imports need `.js`

`package.json` sets `"type": "module"` and `tsconfig.json` uses `module`/`moduleResolution: NodeNext`. Every relative import must carry the **emitted** `.js` extension in the TypeScript source:

```ts
import { AppService } from './app.service.js';   // correct, even though the file is .ts
```

There is no build-time path alias. Omitting the extension is the single most common breakage here.

Related strictness flags that will bite you:
- `verbatimModuleSyntax` → type-only imports must use `import type`.
- `noPropertyAccessFromIndexSignature` → `process.env['KEY']`, never `process.env.KEY`.
- `noUncheckedIndexedAccess` → indexed access yields `T | undefined`.
- `strict`, `noImplicitOverride`.

## Known broken — do not assume you caused it

**Unit tests can't run.** `pnpm test` fails with `Must use import to load ES Module`. Root cause: the Jest config lives in `package.json`, uses `ts-jest` (emits CJS), but the package is ESM. It is missing `extensionsToTreatAsEsm: ['.ts']` plus `--experimental-vm-modules` (or an ESM-capable transform).

**`tsc --noEmit` and `pnpm lint` fail on files unrelated to your change:**
- `src/app.controller.spec.ts:19` calls `appController.getHello()`, which no longer exists on `AppController`.
- `test/app.e2e-spec.ts` imports `'./../src/app.module'` with no `.js` (`TS2307`), imports `INestApplication` as a value (`TS1484`), and can't resolve `supertest/types`.
- `src/utils/functions/function.ts` imports `fs` and never uses it.
- `src/app.service.ts` — all three methods are `async` with no `await` (`@typescript-eslint/require-await` is an **error**, not a warning).

## Env files never resolve

`src/utils/functions/function.ts:5` (`getEnvFile`) maps `NODE_ENV` → `.env.development` | `.env.production` | `.env.test`. The repo actually ships **`.env.local`** and **`.env.test`**. There is no `.env.development`, so:

- `pnpm start:dev` dies at import time — `DATABASE_URL`, `JWT_SECRET`, `COOKIE_SECRET`, `RESEND_API_KEY` all come back `undefined` and `onValidationError` calls `process.exit(1)`.
- `pnpm exec prisma validate` helpfully prints `injected env (0) from .env.development`.

`.env.local` is loaded by nothing. Fix by adding a `.env.development` or repointing the map. Note `NODE_ENV=test` does **not** rescue you: `.env.test`'s `JWT_SECRET` (19 chars) and `COOKIE_SECRET` (22 chars) are under the schema's `min(32)`.

### Env var name drift — silent, not an error

The schema of record is `src/config/validation/validation.ts`. These keys exist in the env files but are **not** in the schema, so they are ignored and the zod default silently wins:

| env file has | schema expects |
|---|---|
| `JWT_SECRET_EXPIRES_IN` | `JWT_EXPIRES_IN` |
| `JWT_SECRET_EXPIRES_IN_REFRESH` | `JWT_REFRESH_EXPIRES_IN` |
| `COOKIE_SAMESITE` | `COOKIE_SAME_SITE` |
| `LIMIT_READ_WINDOW_MS` / `LIMIT_WRITE_WINDOW_MS` / `LIMIT_EMAIL_WINDOW_MS` (`.env.local`, singular) | `LIMIT_READ_WINDOWS_MS` / `LIMIT_WRITE_WINDOWS_MS` / `LIMIT_EMAIL_WINDOWS_MS` (plural) |
| `MAX_PAGINATION_LIMIT` (`.env.test`) | `MAX_PAGINATION` |

When you add an env var, add it to the zod schema in the same change — otherwise it is a no-op.

## Config access: there is no ConfigService

`@nestjs/config` is a dependency but `ConfigModule` is **not registered** in `AppModule`. Env is loaded once at import time by `dotenv.config()` inside `validation.ts`, validated with `@t3-oss/env-core`'s `createEnv`, then re-exported as the plain `settings` object in `src/config/settings.config.ts`. Import `settings` from there; do not inject `ConfigService`.

## Prisma 7 specifics

- Generator is `provider = "prisma-client"` (**not** `prisma-client-js`) with `output = "../generated/prisma"`. The client lands in `generated/prisma/` (gitignored), not `node_modules`. Run `pnpm exec prisma generate` after every schema edit and import from the generated path.
- `datasource db` has **no `url`**. The connection string comes from `prisma.config.ts` → `process.env["DATABASE_URL"]`, so the env-file gap above breaks migrations too.
- `prisma/migrations/` does not exist yet — no migration has ever been created.
- `src/prisma/prisma.service.ts`, `src/prisma/prisma.module.ts`, and `src/shared/index.ts` are **empty files** — placeholders, not implementations. `AppModule` does not import a Prisma module.
- `@prisma/adapter-pg` is installed, so DB access is expected to go through a driver adapter rather than the classic `new PrismaClient()`.

### Schema conventions — do not "fix" these

`prisma/schema.prisma` mixes languages deliberately:
- Models are PascalCase English (`User`, `Book`); tables map via `@@map` to snake_case (`role_permissions`).
- **Enum values are Spanish PascalCase and unquoted** (`Disponible`, `Prestado`, `Aprobada`, `En_Revision`) — valid Prisma, and they become the literal Postgres enum labels.
- Field names are English camelCase; comments and business terms are Spanish.
- Existing typos are load-bearing: `pyhsicalCopyId` (`Loan`, `Incident`), `ubication` (`PhysicalCopy`). Renaming means a migration.

## App conventions

- `src/main.ts` registers a **global `ZodValidationPipe`** (nestjs-zod) → DTOs should be Zod schemas, not class-validator.
- `src/main.ts` calls `app.setGlobalPrefix(settings.server.basePath)` → every route is served under `/api`. CORS origin, helmet, morgan, and cookie-parser are also wired here.
- Tests must live under `src/` as `*.spec.ts` (Jest `rootDir: "src"`). E2E tests go in `test/` as `*.e2e-spec.ts`.
- ESLint uses `recommendedTypeChecked`. `no-explicit-any` is off; `no-floating-promises` and `no-unsafe-argument` are warnings.
- Prettier: single quotes, `trailingComma: "all"`. The eslint rule pins `endOfLine: "auto"` — CRLF in the working tree is expected on Windows, don't "fix" it.

## Repo quirks

- **`pnpm-workspace.yaml` is gitignored and is not a workspace file.** It's pnpm 10's `allowBuilds` allowlist for postinstall scripts (`argon2`, `prisma`, `@prisma/engines`). A fresh clone won't have it, so native builds may be blocked. It also contains a non-boolean placeholder: `'@scarf/scarf': set this to true or false`.
- `pnpm start:prod` is wrong: `nest build` emits to `dist/src/main.js` (the root-level `prisma.config.ts` widens the inferred rootDir), so `node dist/main` fails. Use `node dist/src/main.js`.
- No CI (`.github/` is absent), no husky, no pre-commit hooks, no lint-staged. Nothing runs automatically on commit.
- `.agents/skills/` (gitignored) vendors NestJS/Prisma/TypeScript reference skills; `skills-lock.json` pins their upstream sources.
