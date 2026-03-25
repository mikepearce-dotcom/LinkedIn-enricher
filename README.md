# LinkedIn Enricher

A lightweight Node.js + Prisma starter for managing enriched LinkedIn leads, with a dashboard that includes:

- Total leads
- Leads by status
- Top scored leads
- Recently analysed leads
- Ready-to-contact list

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL (local or cloud)

## Local setup

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   cd LinkedIn-enricher
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create environment variables:

   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your PostgreSQL connection string (`DATABASE_URL`).

5. Generate Prisma client:

   ```bash
   npm run prisma:generate
   ```

6. Run migrations:

   ```bash
   npm run prisma:migrate -- --name init
   ```

7. Start the development server:

   ```bash
   npm run dev
   ```

8. Open the dashboard:

   - `http://localhost:3000`

## Environment variables

Set these in `.env` (and in Railway for production):

- `PORT` (optional): Port for the Node server (default `3000`).
- `DATABASE_URL` (required): Prisma PostgreSQL connection string.

## Prisma commands

- Generate client:

  ```bash
  npm run prisma:generate
  ```

- Create/apply migration in dev:

  ```bash
  npm run prisma:migrate -- --name <migration_name>
  ```

- Open Prisma Studio (optional):

  ```bash
  npm run prisma:studio
  ```

## GitHub push steps

1. Create a new branch:

   ```bash
   git checkout -b feat/dashboard-widgets
   ```

2. Stage changes:

   ```bash
   git add .
   ```

3. Commit:

   ```bash
   git commit -m "Implement dashboard widgets and docs"
   ```

4. Push branch:

   ```bash
   git push -u origin feat/dashboard-widgets
   ```

5. Open a Pull Request on GitHub.

## Railway deployment steps

1. Push your code to GitHub.
2. Create a new project in Railway.
3. Select **Deploy from GitHub repo** and choose this repository.
4. Provision a PostgreSQL service in Railway.
5. In Railway project variables, set:
   - `DATABASE_URL` (from Railway PostgreSQL)
   - `PORT` (Railway typically injects this automatically)
6. Trigger deployment.
7. Run migrations against the Railway database:

   ```bash
   npm run prisma:migrate -- --name production-init
   ```

8. Verify the deployed app URL and dashboard widgets.

## Available npm scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:studio` (optional)
