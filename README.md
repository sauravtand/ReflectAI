# ReflectAI

ReflectAI is a web-based journaling and AI-assisted research application. Participants
write in a journal made of independent **fragments**. After an initial period of normal
journaling, they can use AI-assisted journaling, where each fragment has its own adaptive
question-and-answer conversation and the AI composes a final draft from what the participant
wrote.

> **Status:** Stage 1 (project foundation) is complete. There is no authentication, database
> or AI functionality yet. See [DEVELOPMENT.md](./DEVELOPMENT.md) for the full stage list.

## Research design

These rules shape the whole architecture. They are enforced by the **backend**, never by the
interface alone.

- Days 1 to 10: normal journaling only.
- From day 11: AI-assisted journaling becomes available.
- A journal contains multiple independent fragments.
- Each AI-assisted fragment has its own adaptive Q&A conversation. Participants can skip
  questions or finish a fragment at any time.
- The AI generates a final draft from participant-provided fragments only.
- Original fragments and generated drafts are stored separately and never merged.
- Every AI interaction records timestamps, journal mode, AI model and prompt version.

## Tech stack

| Area       | Choice                                                    |
| ---------- | --------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack, Cache Components)      |
| Language   | TypeScript, strict mode                                   |
| UI         | React 19, Tailwind CSS 4, shadcn/ui (new-york), Lucide    |
| Validation | Zod 4                                                     |
| Database   | Supabase PostgreSQL and Auth (Stage 3 and 4)              |
| Media      | Cloudflare R2 (Stage 7)                                   |
| AI         | Gemini API (Stage 8 and 9)                                |
| Quality    | ESLint, Prettier, Vitest (Playwright is added in Stage 2) |

## Getting started

Requires Node.js `^20.19.0` or `>=22.12.0` (`.nvmrc` pins 22).

```bash
npm install
cp .env.example .env.local   # optional in Stage 1, see "Environment variables"
npm run dev                  # http://localhost:3000
```

## Scripts

| Script              | What it does                                               |
| ------------------- | ---------------------------------------------------------- |
| `npm run dev`       | Start the development server                               |
| `npm run build`     | Production build                                           |
| `npm run start`     | Serve the production build                                 |
| `npm run lint`      | ESLint (`lint:fix` applies safe fixes)                     |
| `npm run typecheck` | Generate Next.js route types, then `tsc --noEmit`          |
| `npm run test`      | Run unit tests once (`test:watch` for watch mode)          |
| `npm run format`    | Format everything with Prettier (`format:check` to verify) |
| `npm run check`     | Lint, type check and tests in one go                       |

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values. **Never commit `.env.local`.**
Stage 1 calls no external service, so everything works without them. Variables are validated
with Zod in `lib/env` the first time a later stage needs them, and the error lists the names
of any missing variables but never their values.

| Variable                        | Exposed to browser | Used from | Purpose                                                        |
| ------------------------------- | ------------------ | --------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`           | yes                | Stage 3   | Public base URL of the app                                     |
| `NEXT_PUBLIC_SUPABASE_URL`      | yes                | Stage 3   | Supabase project URL                                           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes                | Stage 3   | Public anon key (protected by row-level security)              |
| `SUPABASE_SERVICE_ROLE_KEY`     | **no, secret**     | Stage 4   | Bypasses row-level security. Server only                       |
| `R2_ACCOUNT_ID`                 | **no, secret**     | Stage 7   | Cloudflare account                                             |
| `R2_ACCESS_KEY_ID`              | **no, secret**     | Stage 7   | R2 API token                                                   |
| `R2_SECRET_ACCESS_KEY`          | **no, secret**     | Stage 7   | R2 API token secret                                            |
| `R2_BUCKET_NAME`                | **no, secret**     | Stage 7   | Media bucket                                                   |
| `GEMINI_API_KEY`                | **no, secret**     | Stage 8   | Gemini API key                                                 |
| `GEMINI_MODEL`                  | **no, secret**     | Stage 8   | Exact model id. Required, no default, recorded per interaction |

Server-only variables live in `lib/env/server.ts`, which imports `server-only` so the build
fails if it is ever pulled into client code.

## Project structure

```text
app/                    Routes, layouts and global styles (App Router)
  (public)/             Public pages that share the header/footer shell
  fonts/                Self-hosted variable fonts and their licences
  globals.css           Design tokens, type scale, base styles
  layout.tsx            Root layout: fonts, metadata, viewport
  error.tsx             Root error boundary
  not-found.tsx         404 page
components/
  brand/                Logo and mark
  layout/               PageContainer, SiteHeader, SiteFooter, SiteShell
  ui/                   shadcn/ui primitives (button so far)
lib/
  env/                  Zod-validated environment access (public and server-only)
  supabase/             Supabase clients and queries (Stage 3 and 4)
  ai/                   Gemini integration and prompt versions (Stage 8 and 9)
  storage/              Cloudflare R2 media handling (Stage 7)
  research/             Research phase rules (Stage 5)
  site.ts               Product name and copy
  utils.ts              cn() class-name helper
hooks/                  Shared React hooks
types/                  Shared TypeScript types
tests/                  Vitest unit tests (tests/unit) and stubs
```

## Design system

Warm white paper, charcoal ink, one sage accent. Tokens are CSS variables in
`app/globals.css`, exposed to Tailwind (`bg-background`, `text-muted-foreground`,
`bg-primary`, and so on).

- **Colours:** background `#FAF8F4`, foreground `#2A2C28`, sage primary `#55775F`.
  Text and button colours meet WCAG AA contrast.
- **Fonts:** Newsreader (serif, headings and journal text) and Instrument Sans (interface).
  Both are self-hosted, so no visitor's browser contacts a third party for fonts.
- **Type scale:** `text-display`, `text-heading`, `text-title`, `text-lead`. Large sizes scale
  fluidly with the viewport. Use `journal-prose` on anything a participant has written.
- **Widths:** `max-w-page` for page chrome, `max-w-reading` for prose. Wrap top-level blocks
  in `PageContainer` so edges line up.
- Light theme only, by design. Focus rings are always visible and reduced motion is respected.

### Adding shadcn/ui components

`components.json` is configured. In an environment with internet access:

```bash
npx shadcn@latest add card input label
```

If the CLI cannot reach `ui.shadcn.com`, copy the component source into `components/ui/`
by hand and match the conventions in `components/ui/button.tsx`.

## Things specific to this Next.js version

This project uses Next.js 16 with **Cache Components** and **Partial Prefetching** turned on
in `next.config.ts`. The behaviour differs from older versions, and `AGENTS.md` tells
contributors (human and AI) to read the docs in `node_modules/next/dist/docs/` first.
Practical consequences already hit in this codebase:

- Reading the current date, `Math.random()` or `crypto.randomUUID()` in a prerendered
  component fails the build. Do that at request time inside `<Suspense>`, or in a Client
  Component. This is why the footer has no copyright year.
- In `error.tsx` the recovery callback is `retry`, not `reset`.
- Folders starting with `_` are private and do not create routes.
- Fonts are loaded with `next/font/local`; Google Fonts are not used.

## Testing

```bash
npm run test
```

Unit tests live in `tests/unit`. End-to-end tests with Playwright are added in Stage 2 once
there are routes to cover.

## Security notes

- Secrets are only read on the server through `lib/env/server.ts`. Do not prefix a secret
  with `NEXT_PUBLIC_`; Next.js inlines those into the browser bundle.
- The site is set to `noindex` until a deliberate launch decision is made.
# ReflectAI

# supa_base:UsfOT16rS6INxuB9
