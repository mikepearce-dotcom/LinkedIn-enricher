# LinkedIn Outreach Prep (CRO Audit)

A production-oriented internal app for preparing higher-quality LinkedIn outreach without scraping, automation, or message sending.

## Step 1 — Product / Tech Plan

### Product summary
- Single-user internal workspace to store leads, analyse websites, spot CRO issues, generate short message sequences, and manage workflow.
- Built around relevance-first, problem-first outreach and concise British-English messaging.

### Architecture overview
- **Frontend:** Next.js App Router + TypeScript + Tailwind.
- **Backend:** Next.js Route Handlers (server-side API).
- **Database:** PostgreSQL with Prisma ORM.
- **AI layer:** OpenAI API on server routes only.
- **Hosting:** Railway with environment variables.

### Database schema
- `Lead` (core entity + pipeline stage + score).
- `LeadAnalysis` (homepage summary, observed issues, hypotheses, next checks).
- `MessageDraftSet` (connection note + follow-ups + offer framing).
- `Note` (internal notes).
- `ActivityEvent` (timeline for key actions).

### Route map
- `/` dashboard
- `/leads` lead list + quick create
- `/leads/[id]` lead workspace
- `/api/leads` GET/POST
- `/api/leads/[id]` GET/PATCH/DELETE
- `/api/leads/[id]/analyse` POST
- `/api/leads/[id]/drafts` POST
- `/api/leads/[id]/notes` POST
- `/api/leads/[id]/status` POST

### OpenAI prompt strategy
- Website analysis prompt enforces separation of observed issues, hypotheses, and next checks.
- Message prompt enforces British English, short-form, problem-first, low-hype tone.
- JSON schema output format for consistent parsing.

### Risks / edge cases
- Some websites block fetch/crawlers.
- Incomplete homepage copy can reduce analysis quality.
- No OpenAI key: app falls back to deterministic defaults.

### Railway deployment plan
1. Push repo to GitHub.
2. Create Railway project from GitHub repo.
3. Add Postgres service.
4. Set env vars: `DATABASE_URL`, `OPENAI_API_KEY`, `NODE_ENV=production`.
5. Deploy and run `npm run prisma:deploy`.

### Git structure
- `app/` routes + API handlers
- `components/` UI components
- `lib/` Prisma client, scoring, AI services
- `prisma/` schema + migrations

### Phased build plan
1. Plan (this section)
2. Scaffold (Next + Tailwind + Prisma wiring)
3. Core features (CRUD, analysis, drafts, notes, activity, dashboard)
4. Deployment readiness (scripts, env docs, Railway runbook)

---

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

- `DATABASE_URL` (required)
- `OPENAI_API_KEY` (recommended)
- `NODE_ENV` (required in deployment)

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:deploy`

## Git + Railway flow

```bash
git init
git add .
git commit -m "Initial LinkedIn outreach prep app"
git remote add origin <github-url>
git push -u origin main
```

Then link GitHub repo in Railway and deploy.
