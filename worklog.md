# IB4G BugTracker — Worklog & Handover Document

## Project Status (as of initial build)

**Status: ✅ Fully functional — v1.0.0 complete and browser-verified**

The IB4G BugTracker is a structured bug-report management system based on the IB4G Jira template.
Users paste a Jira-style template into a single textarea and the system auto-parses 16+ structured
fields (overview breadcrumb, environment, preconditions, steps, actual/expected results, 3-tier
impact analysis, technical notes) into a normalized database.

The project was built from a fresh Next.js 16 scaffold — no prior bug-tracker code existed.
The entire application (schema, parser, API, hooks, store, 14 UI components) was implemented
in a single session and verified end-to-end with `agent-browser`.

### Tech stack (as built)
- Next.js 16 (App Router) + TypeScript 5 + Turbopack
- Tailwind CSS 4 + shadcn/ui (New York) + Lucide icons
- Prisma 6 + **SQLite** (local file at `db/custom.db`) — note: user spec mentioned Supabase/Postgres,
  but the sandbox ships with SQLite; the Prisma schema is provider-agnostic and can be swapped to
  Postgres by changing the `datasource` block + `DATABASE_URL`.
- TanStack Query (server state) + Zustand (client state / navigation / filters)
- Recharts (dashboard charts) + react-markdown + date-fns + sonner (toasts) + next-themes

---

## What was built (completed modifications)

### 1. Data layer
- `prisma/schema.prisma` — `Bug` (27 fields incl. overview/env/impact/stage/status/priority),
  `Label`, `BugLabel` (many-to-many). Indexes on status/priority/stage/updatedAt.
- `src/lib/db.ts` — Prisma singleton (log level reduced to `error`/`warn`).
- `scripts/seed.ts` — Seeds 8 realistic sample bug reports + 8 colored labels.

### 2. Core engine — `src/lib/template-parser.ts`
- `parseTemplate(raw)` — splits `## Section` headers, parses:
  - Jira Summary → extracts `[A-Z]+-\d+` Jira ID + strips `[Bug][Tag]` prefixes
  - Overview breadcrumb (`A > B > C > D > E > F`) → loginCondition / platform / module / trigger / issue
  - Environment (`Key: Value` lines) → envPage / envPlatform / envOS / envBrowser
  - Preconditions (`-` bullets), Steps to Reproduce (`1.` numbered)
  - Actual / Expected Result (free text)
  - Impact → 3 subsections (User / Business / QA) via `###` or `**Label:**` or `Label:` headers;
    falls back to treating the whole block as userImpact if no subsections detected
  - Technical Notes (free text / code)
- `reconstructTemplate(bug)` — rebuilds the original template text from stored DB fields
  (used by the "Copy template" button in the detail view).
- `reconstructOverviewBreadcrumb(...)` — rebuilds the `>`-joined breadcrumb.

### 3. API (11 routes, all Zod-validated)
- `GET /api/info` — app metadata + endpoint list + env vars
- `GET /api/bugs` — list with filters (search, status, priority, platform, stage, assignee,
  labelId, page, pageSize) + pagination metadata
- `POST /api/bugs` — create; accepts a raw `overview` template string and auto-parses it
  (explicit fields override parsed ones)
- `GET/PUT/DELETE /api/bugs/[id]` — single-bug CRUD; PUT supports partial updates and
  re-parsing if a new `overview` is supplied; labelIds replace the label set
- `GET /api/bugs/stats` — dashboard aggregates (total/open/closed/critical, byStatus,
  byPriority, byStage, byPlatform, recent 5)
- `GET/POST /api/labels` + `GET/PUT/DELETE /api/labels/[id]` — label CRUD with unique-name
  constraint handling

### 4. Client state
- `src/hooks/use-bugs.ts` — 8 TanStack Query hooks (list, detail, stats, create/update/delete
  bug, labels CRUD, app info) with optimistic invalidation + sonner toasts.
- `src/store/bug-store.ts` — Zustand store: active view, selected bug id, sidebar collapse,
  mobile sheet open, bug-list filters (debounced search handled in the list view), labels cache,
  form-dialog state (create vs edit mode).

### 5. UI (14 components in `src/components/bugs/`)
- **Badges**: `status-badge`, `priority-badge`, `stage-badge`, `label-badge` — all theme-aware
  with colored dots + semantic Tailwind classes (no indigo/blue).
- **Form**: `bug-form` (Title / Jira ID / Stage toggles / Priority toggles / Overview textarea
  with live-parse preview popover / Label picker) + `bug-form-dialog` (create/edit wrapper).
- **Views**:
  - `dashboard-view` — 4 stat cards + 3 charts (status bar, priority donut, stage donut with
    center totals + legends) + recent-activity list
  - `bug-list-view` — filter bar (debounced search + 4 selects) + table (responsive column
    hiding) + pagination + "Export all" (copies title+id to clipboard)
  - `bug-detail-view` — header (badges + Jira ID + actions) + 9 content cards (Overview
    breadcrumb, Environment grid, Preconditions, Steps, Actual/Expected, Impact Analysis with
    3 sub-sections, Technical Notes code block) + sidebar (Quick Edit for status/priority/stage,
    Labels, Quick Info) + Copy-template + Delete confirm
  - `info-view` — 6 metadata cards + endpoints table (method-colored badges + copy buttons) +
    env-vars list + 5-step setup guide
  - `labels-view` — responsive grid of label cards with inline edit + create/delete dialogs
- **Layout**: `app-sidebar` (collapsible 60px↔224px, nav + theme toggle + collapse button) +
  `app-content` (desktop sidebar + mobile Sheet + scrollable main + global form dialog).

### 6. Styling & UX
- Light/dark themes via `next-themes` (ThemeProvider in layout).
- Custom scrollbar styling + fade-in / slide-in animations in `globals.css`.
- Semantic color system: amber (open), emerald (closed), rose (critical), orange (high),
  sky (medium), slate (low), violet (dev), cyan (staging), red (production).
- Mobile-first responsive: hamburger → Sheet sidebar; table columns hide progressively.
- Sticky app shell (`h-screen` + internal scroll) — no floating-footer issue.

---

## Verification results

Verified end-to-end with `agent-browser` at 1440×900 desktop + iPhone 14 mobile:

| Flow | Result |
|------|--------|
| Dashboard renders (4 stat cards, 3 charts, 5 recent bugs) | ✅ |
| Bug list loads 8 bugs with badges + pagination | ✅ (after fixing `labelId=all` filter bug) |
| Bug detail shows all 9 cards + Quick Edit sidebar | ✅ |
| New-bug form: Template popover → "Use template" → live-parse preview (16 fields) | ✅ |
| Form submission → POST 201 → bug appears at top of list | ✅ |
| Created bug's detail shows all auto-parsed fields correctly | ✅ |
| Labels view: 8 labels with colors + edit/delete | ✅ |
| Endpoints view: 6 metadata cards + 11-route table + setup guide | ✅ |
| Dark mode toggle (html class switches to `dark`) | ✅ |
| Mobile: hamburger opens Sheet sidebar; nav closes sheet | ✅ |
| ESLint (`bun run lint`) | ✅ 0 errors, 0 warnings |
| Console / runtime errors | ✅ none |

### Bug fixed during verification
- `use-bugs.ts` was sending `labelId=all` to the API, which the backend interpreted as a literal
  label-ID filter and returned an empty list. Fixed by skipping the param when value is `"all"`.

---

## Unresolved issues / risks

None blocking. Minor notes for future iterations:

1. **Database provider** — currently SQLite (sandbox default). To move to Supabase/Postgres as
   the original spec mentions, change `datasource db { provider = "postgresql" }` in
   `prisma/schema.prisma`, set `DATABASE_URL`, and run `bun run db:push`. The schema is
   already Postgres-compatible (no SQLite-specific types used).
2. **Auth** — not implemented. `reporter` defaults to `"Anonymous"`. NextAuth.js v4 is installed
   and available if user accounts become needed.
3. **Search** — uses SQL `contains` (case-sensitive on SQLite). For full-text search, consider
   a `FTS5` virtual table or migrating to Postgres `tsvector`.
4. **Real-time** — no WebSocket; lists rely on TanStack Query refetch/staleTime. A socket.io
   mini-service could be added for live updates (infrastructure is documented in the system prompt).
5. **Export** — currently copies title+id to clipboard. A CSV/JSON download would be a nice add.
6. **Assignee** — stored as a plain string; no user picker UI yet.

---

## Priority recommendations for the next phase

1. **Polish**: add empty-state illustrations, keyboard shortcuts (e.g. `n` for new bug, `/` to
   focus search), and a command-palette (cmdk is already installed).
2. **Bulk actions**: multi-select rows in the bug list → bulk status/priority change, bulk delete,
   bulk label assignment.
3. **Activity log / audit trail**: track status/priority changes over time (new `BugEvent` model).
4. **CSV/JSON export + import**: let users bulk-import bugs from a template file.
5. **Saved filters / views**: persist filter presets per user.
6. **Assignee management**: simple user list + assignee filter + avatar display.
7. **Richer charts**: trend over time (bugs opened vs closed per day), platform breakdown chart
   on the dashboard.

---

## File map (custom code)

```
prisma/schema.prisma                      ← Bug / Label / BugLabel models
scripts/seed.ts                           ← 8 sample bugs + 8 labels
src/app/layout.tsx                        ← ThemeProvider + fonts + toast
src/app/page.tsx                          ← QueryClientProvider + AppContent
src/app/globals.css                       ← scrollbar + animations + selection
src/app/api/info/route.ts                 ← GET app info
src/app/api/bugs/route.ts                 ← GET list + POST create
src/app/api/bugs/[id]/route.ts            ← GET + PUT + DELETE
src/app/api/bugs/stats/route.ts           ← GET dashboard stats
src/app/api/labels/route.ts               ← GET + POST
src/app/api/labels/[id]/route.ts          ← PUT + DELETE
src/lib/types.ts                          ← all TS interfaces
src/lib/constants.ts                      ← status/priority/stage/label config + sidebar items
src/lib/db.ts                             ← Prisma singleton
src/lib/serialize.ts                      ← Prisma row → API shape (parses JSON arrays)
src/lib/template-parser.ts                ← 🔥 parse + reconstruct engine
src/hooks/use-bugs.ts                     ← 8 TanStack Query hooks
src/store/bug-store.ts                    ← Zustand store
src/components/theme-provider.tsx         ← next-themes wrapper
src/components/bugs/app-content.tsx       ← shell: sidebar + main + mobile sheet + form dialog
src/components/bugs/app-sidebar.tsx       ← collapsible nav + theme toggle
src/components/bugs/dashboard-view.tsx    ← 4 stat cards + 3 charts + recent
src/components/bugs/bug-list-view.tsx     ← filters + table + pagination + export
src/components/bugs/bug-detail-view.tsx   ← 9 cards + Quick Edit sidebar
src/components/bugs/bug-form.tsx          ← 5 inputs + template popover + live preview
src/components/bugs/bug-form-dialog.tsx   ← create/edit dialog wrapper
src/components/bugs/info-view.tsx         ← metadata + endpoints + setup guide
src/components/bugs/labels-view.tsx       ← label CRUD grid
src/components/bugs/status-badge.tsx
src/components/bugs/priority-badge.tsx
src/components/bugs/stage-badge.tsx
src/components/bugs/label-badge.tsx
```

---

## How to run

```bash
bun run dev          # http://localhost:3000 (dev server, auto-restart)
bun run lint         # ESLint
bun run db:push      # apply schema changes
bun run scripts/seed.ts   # (re)seed sample data
```

The dev server is currently running in the background and the database is seeded with 8 sample
bug reports + 8 labels.
