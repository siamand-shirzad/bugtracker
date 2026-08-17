# Deploying IB4G BugTracker

## 1. Push to GitHub

> **Note:** this repo originally had `output: "standalone"` set in `next.config.ts`, paired with a build script that copied static assets into `.next/standalone`. That setup is for self-hosting (there's a `Caddyfile` in the repo suggesting it was built for a Caddy/Docker-style host) and it **breaks Vercel builds** with an `ENOENT ... next-server.js.nft.json` error, because Vercel has its own build/serving pipeline and doesn't expect standalone output. Both have been removed so the project builds cleanly on Vercel; `npm run build` now just runs `next build`, and `npm run start` runs `next start`. If you later want to self-host on something like Railway or a VPS, you can reintroduce `output: "standalone"` for that deployment target.

This project is already a git repo (it has commit history from the original build). It has **no remote configured yet**, so:

```bash
# from the project root
git add -A
git commit -m "Redesign: ink & signal theme"

# create a new empty repo on GitHub first (github.com/new — don't
# initialize it with a README/gitignore, since this repo already has one),
# then:
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

If you'd rather use the GitHub CLI instead of creating the repo on the website first:

```bash
gh repo create <your-repo> --private --source=. --remote=origin --push
```

### Before you push
- `.env` is already gitignored — good, it won't be committed. A `.env.example` file has been added instead so collaborators (and you, on a fresh clone) know what variable to set.
- `db/custom.db` (your local SQLite database) is **not** currently gitignored. If you don't want your local bug data committed to the repo, add this to `.gitignore`:
  ```
  db/*.db
  ```
  If you're fine shipping your current data as seed content, leave it as is.

## 2. Deploying the app

This is a Next.js app, so **Vercel** is the simplest path — but there's one important catch with your database.

### ⚠️ SQLite + serverless doesn't persist
Your app uses SQLite via Prisma (`db/custom.db`, a file on disk). Vercel's filesystem is **read-only and ephemeral** in production — any writes to the SQLite file will either fail or get wiped on the next deploy. This will work fine to *build and browse*, but bug reports you create in production won't reliably save.

You have three reasonable options:

**Option A — Switch to a hosted database (recommended for real use)**
Swap SQLite for a hosted Postgres/MySQL provider with a generous free tier — e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Turso](https://turso.tech) (Turso is SQLite-compatible, so it's the smallest change). Update `prisma/schema.prisma`'s `datasource` provider and `DATABASE_URL` accordingly, then `npx prisma db push`.

**Option B — Deploy somewhere with a persistent disk**
[Railway](https://railway.app) or [Render](https://render.com) support persistent volumes, so SQLite works as-is. Slightly more setup than Vercel, but no database migration needed.

**Option C — Just want to preview the UI**
Deploy to Vercel anyway. Reads will work against whatever data exists at build time; new writes just won't stick. Fine for showing off the redesign, not for daily use.

### Deploying to Vercel (once your DB is sorted)

1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repo.
2. Vercel auto-detects Next.js — no build config needed.
3. Add your environment variable: `DATABASE_URL` = your hosted database's connection string (Settings → Environment Variables).
4. Deploy. Every push to `main` will auto-deploy from now on.

### Deploying to Railway (if you want to keep SQLite)

1. [railway.app/new](https://railway.app/new) → "Deploy from GitHub repo".
2. Add a persistent volume mounted at `/app/db` (or wherever `db/custom.db` resolves) so the SQLite file survives deploys.
3. Set `DATABASE_URL="file:./db/custom.db"` as an environment variable.
4. Railway will run `npm install` and `npm run build` automatically; set the start command to `npm run start`.

## 3. Local checklist (npm)

```bash
npm install
npm run db:push     # creates db/custom.db from prisma/schema.prisma
npm run dev          # http://localhost:3000
```

For a production build locally:
```bash
npm run build
npm run start
```
