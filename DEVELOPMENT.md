# DiaryMate development log

Single source of truth for what is built, what is next, and why decisions were made.
Updated at the end of every stage.

## Stage overview

| #   | Stage                                  | Status       | Scope                                                                                                                                                                                                                                                        |
| --- | -------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Project setup                          | **Complete** | Next.js, strict TypeScript, Tailwind, shadcn/ui, Zod, ESLint/Prettier, folder architecture, design system, global layout, env template, README                                                                                                               |
| 2   | User interface (static)                | Pending      | Landing, login and registration UI, dashboard, journal history, calendar, new journal, journal detail, settings, research info. Normal vs AI-assisted experiences. Fixtures kept separate from production data. Playwright setup and route/responsive checks |
| 3   | Authentication and participant profile | Pending      | Supabase Auth, protected routes, sign-up/login/logout, participant profile with enrolment date                                                                                                                                                               |
| 4   | Database schema and security           | Pending      | Migrations, row-level security, tables for journals, fragments, AI conversations, drafts                                                                                                                                                                     |
| 5   | Research phase engine                  | Pending      | Backend-enforced day and phase calculation (days 1-10 normal, day 11+ AI-assisted), used by every API route, heavily tested                                                                                                                                  |
| 6   | Normal journaling                      | Pending      | Journal and fragment create/read/update/delete with loading, error, empty and success states                                                                                                                                                                 |
| 7   | Media                                  | Pending      | Cloudflare R2 uploads via server-signed URLs, attachments                                                                                                                                                                                                    |
| 8   | AI conversation                        | Pending      | Gemini server-side, adaptive per-fragment Q&A, skip and finish, versioned prompts recorded with each interaction                                                                                                                                             |
| 9   | Draft generation                       | Pending      | AI final draft from participant fragments only, stored separately from originals, model, prompt version and timestamps recorded                                                                                                                              |
| 10  | Research integrity and privacy         | Pending      | Immutable originals, audit fields, data export, consent and deletion handling                                                                                                                                                                                |
| 11  | Hardening and deployment               | Pending      | Full Playwright suite, security review, accessibility pass, deployment guide                                                                                                                                                                                 |

> Numbering follows the instructions given in conversation, where "Stage 2" means the user
> interface. It differs from the first roadmap sketch, which put authentication at Stage 2.

## Stage 1: Project setup (complete)

### Delivered

- Next.js 16.4.6 App Router project with Turbopack, TypeScript strict mode
  (plus `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`),
  Tailwind CSS 4.3.3.
- shadcn/ui configured (`components.json`, `cn()` helper, Radix, CVA) with a `Button`.
- Lucide icons, Zod 4 installed. `lib/env` validates environment variables with Zod, split
  into public and server-only modules.
- ESLint (Next + TypeScript + Prettier compatibility, type-import and no-console rules) and
  Prettier (with Tailwind class sorting).
- Folder architecture: `app`, `components`, `components/ui`, `lib`, `lib/supabase`,
  `lib/ai`, `lib/storage`, `lib/research`, `hooks`, `types`, `tests`.
- Design system in `app/globals.css`: warm white, charcoal and sage tokens, type scale,
  `journal-prose` reading style, visible focus, reduced-motion support.
- Self-hosted fonts: Newsreader (with optical sizing) and Instrument Sans.
- Global layout: root layout, `(public)` route-group shell with skip link, header, footer,
  `PageContainer`; root error boundary and 404 page.
- `.env.example`, `README.md`, this file, Vitest with 11 unit tests.

### Verification results

| Check                              | Result                                                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| `npm run lint`                     | Pass, 0 errors, 0 warnings                                                                          |
| `npm run typecheck`                | Pass                                                                                                |
| `npm run test`                     | Pass, 2 files, 11 tests                                                                             |
| `npm run build`                    | Pass, routes `/`, `/_not-found`, `/icon.svg` prerendered                                            |
| `npm run dev`                      | Pass, `/` 200, unknown route 404                                                                    |
| `prettier --check .`               | Pass                                                                                                |
| Browser check at 1440, 820, 390 px | Fonts load, colours match tokens, no horizontal overflow, no console errors                         |
| External network requests          | None (all fonts and assets are same-origin)                                                         |
| Error boundary                     | Verified end to end with a temporary route: error screen shows, "Try again" recovers. Route removed |
| Regression test validity           | Confirmed the `cn()` type-scale test fails when its fix is removed                                  |

### Decisions and reasons

1. **Fonts are self-hosted.** The build environment cannot reach Google Fonts, and no
   participant's browser should contact a third party to render a research interface.
   Font files come from Fontsource packages (SIL Open Font Licence, licences included in
   `app/fonts`). The Latin subset covers æ, ø and å.
2. **Route group `(public)` holds the header/footer shell.** The root layout only provides
   fonts, metadata and `<body>`, so the dashboard in Stage 2 can use a different shell with a
   sidebar.
3. **Environment validation is lazy.** `getPublicEnv()` and `getServerEnv()` run when called,
   not at import time, so builds and tests succeed without credentials. Errors name variables
   and never print values. `lib/env/server.ts` imports `server-only`.
4. **`GEMINI_MODEL` has no default.** The model is recorded with every AI interaction, so it
   must be an explicit choice.
5. **Custom type scale needed a `tailwind-merge` extension.** Without it `text-display`
   is treated as a colour and silently dropped next to `text-foreground`. Covered by a test.
6. **`@types/node` raised from `^20` to `^22`.** Vitest 5 requires it, and it matches the
   Node 22 runtime.
7. **No copyright year in the footer.** With Cache Components, reading the date in a
   prerendered shell fails the build.
8. **Light theme only.** The brief specifies a warm white look; a dark theme is a later,
   deliberate decision.
9. **`noindex` is on.** Search engines are told not to index the site until a launch decision
   is made. Revisit in Stage 11.

### Known issues and limitations

- **shadcn CLI was not run.** The sandbox could not reach `ui.shadcn.com`, so
  `components.json` and `components/ui/button.tsx` were written by hand following the
  new-york conventions. Run `npx shadcn@latest add <component>` locally for further
  components; it should work with this configuration.
- **`npm audit` reports 8 moderate findings, all dev-only.** They are one `minimatch`
  denial-of-service advisory inside the ESLint toolchain (via `eslint-config-next`).
  Production dependencies report 0 vulnerabilities. `npm audit fix --force` would downgrade
  `eslint-config-next` to 15.x, which mismatches Next 16, so it was not applied. Recheck when
  `eslint-config-next` publishes a fix.
- **Playwright is not installed yet.** Stage 1 did not require it and there are no routes
  worth testing end to end. It is planned for Stage 2.
- **`AGENTS.md` is generated by Next.js** and re-added by `next dev`. Commit it with the
  project to keep the working tree clean.
- **Not verified here:** deployment on a real host, and behaviour on iOS Safari and Firefox.
  The browser check used Chromium only.

### Open questions (none block Stage 2)

1. **Interface language:** English only, Danish only, or both? Everything is English for
   now (`<html lang="en">`). Supporting both is much cheaper to plan before the UI stage than
   to retrofit.
2. **Definition of "day 1"** (enrolment date or first journal entry) and **which timezone
   defines a day.** Required before Stage 5. Proposed default: enrolment date, with
   Europe/Copenhagen midnight boundaries.

## Conventions

- Only implement the stage requested. Do not start the next stage automatically.
- Keep secrets server-side. Never put a secret in a `NEXT_PUBLIC_` variable.
- Use real database operations. Development fixtures must be clearly labelled and kept in
  their own folder, never mixed into production code paths.
- Research logic changes must be explained with their implications before they are made.
- Read `node_modules/next/dist/docs/` before relying on memory of Next.js APIs. This version
  has breaking changes.
- Before declaring a stage complete: `npm run lint`, `npm run typecheck`, `npm run test`,
  `npm run build`, and check `npm run dev`.
