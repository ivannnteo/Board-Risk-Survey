# Board Risk Preparedness Survey

A small Next.js app for a board-risk survey event:

- **Clients** (`/`) rank their top 3 organisational risks, self-assess which
  preparedness actions they've taken for each, name their biggest barrier to
  resilience, and immediately see a personalised results table.
- **Admins** (`/admin`, password-protected) see live aggregate charts across
  all submissions.

## Stack

- Next.js 14 (App Router, TypeScript)
- Prisma + PostgreSQL (works with any managed Postgres — Neon, Supabase,
  Railway, etc. — so data survives on serverless hosts like Vercel)
- Recharts for charts, lucide-react for icons, Tailwind CSS for styling
- Single shared admin password, signed cookie session (no extra auth service)

**Requires Node.js 20+** (the admin session signing uses the standard Web
Crypto global, which needs a modern Node/Edge runtime).

## Local setup

1. Install [Node.js LTS](https://nodejs.org/) (20+) if you don't have it.
2. Create a free Postgres database — pick one:
   - [Neon](https://neon.tech) — free tier, instant provisioning
   - [Supabase](https://supabase.com) — free tier, includes a Postgres instance
   - [Railway](https://railway.app) — free trial credits
   Copy the connection string it gives you.
3. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — the connection string from step 2
   - `ADMIN_PASSWORD` — whatever password admins should use to log in
   - `ADMIN_SESSION_SECRET` — a long random string (e.g. `openssl rand -base64 32`)
4. Install dependencies and set up the database schema:
   ```
   npm install
   npx prisma migrate dev --name init
   ```
5. Run the dev server:
   ```
   npm run dev
   ```
6. Visit `http://localhost:3000` for the survey, and
   `http://localhost:3000/admin/login` for the admin dashboard.

## Deploying (e.g. to Vercel)

1. Push this project to a Git repository and import it into Vercel (or your
   platform of choice).
2. Set the same three environment variables (`DATABASE_URL`,
   `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`) in the platform's project
   settings — use your production Postgres connection string.
3. The build command is already wired to run `prisma generate` before
   `next build` (see `package.json`). After the first deploy, run
   `npx prisma migrate deploy` once (locally, pointed at the production
   `DATABASE_URL`, or via your platform's release/build hook) to create the
   `Response` table in production.
4. Redeploy whenever you change `prisma/schema.prisma`, running
   `npx prisma migrate deploy` against production again after each schema
   change.

## How scoring works

Each of the 3 chosen risks has 6 possible preparedness actions
(`lib/domain.tsx`). The % of actions selected maps to a rating:

| % of applicable actions implemented | Rating             |
| ------------------------------------ | ------------------ |
| 0% – 25%                             | Not Prepared        |
| 26% – 50%                            | Somewhat Prepared   |
| 51% – 75%                            | Prepared            |
| 76% – 100%                           | Very Prepared       |

This logic lives in `getPreparednessInfo()` in `lib/domain.tsx` and is shared
by both the client results table and the admin dashboard's Preparedness Index
chart, so they can never disagree.

## Admin dashboard charts

- **Top Risks Selected** — pie chart, Question 1 selection frequency across
  all 10 risk categories.
- **Preparedness Index** — pie chart of Not/Somewhat/Prepared/Very Prepared,
  computed only from the 3 risk categories that are, overall, the most
  frequently selected.
- **Risk Frequency — Full Ranking** — the same Question 1 data as a bar
  chart, for comparing all 10 categories at a glance.
- **Biggest Barriers to Resilience** — bar chart of Question 3 answers.

## Project structure

```
app/
  page.tsx                    Client survey entry point
  components/SurveyFlow.tsx   Survey state machine (Q1 -> Q2 x3 -> Q3 -> results)
  components/ui.tsx           Shared UI: Row, NavButtons, ProgressHeader, Card, PieBlock, BarBlock
  admin/login/page.tsx        Admin login form
  admin/page.tsx              Admin dashboard route
  admin/AdminDashboard.tsx    Dashboard client component (fetches /api/admin/stats)
  api/responses/route.ts      POST - validates and saves a client submission
  api/admin/login/route.ts    POST - checks password, sets signed session cookie
  api/admin/logout/route.ts   POST - clears session cookie
  api/admin/stats/route.ts    GET (protected) - aggregates all responses for the dashboard
lib/
  domain.tsx                  Risks, actions, barriers, and the preparedness rating logic
  theme.ts                    Shared color tokens
  prisma.ts                   Prisma client singleton
  auth.ts                     Signed-cookie session helpers (Web Crypto)
middleware.ts                 Protects /admin and /api/admin/* routes
prisma/schema.prisma          Database schema
```
