# UTC Auditor

A working implementation of the Unit Test Case Auditing Application described
in the Initial Phase requirements spec: a backend + authenticated dashboard
(this Next.js app) and a standalone `@utc-auditor/cli` npm package
(`/audit-engine`) that runs inside a client's React/Next.js repo.

```
utc-auditor/
├── app/                 Next.js dashboard + REST API (sections 12–14)
├── components/          Dashboard UI (score dial, coverage bars, trend chart…)
├── lib/                 Data model, file-backed store, session auth
├── data/db.json         Seed data (2 clients, 3 projects, 18 historical reports)
├── scripts/seed.js      Regenerates data/db.json
└── audit-engine/        The installable npm package (sections 5–9)
    ├── src/              discovery → Jest run → rules → analysis → report → submit
    └── example/          Sample utc-auditor.config.js for a client repo
```

## Run the dashboard

```bash
npm install
npm run seed     # optional — data/db.json is already generated
npm run dev
```

Open `http://localhost:3000` and sign in with one of the demo accounts shown
on the login screen (admin, or a client-scoped user for either seeded
client).

## Run the audit engine against a real project

See `audit-engine/README.md`. In short: copy
`audit-engine/example/utc-auditor.config.example.js` into a client repo as
`utc-auditor.config.js`, set `UTC_AUDITOR_BACKEND_URL` /
`UTC_AUDITOR_TOKEN`, and add `utc-audit run --trigger production_build` to
the `build` script. Demo tokens matching the seed data live in
`lib/auth.ts` (`utc_demo_token_atlas`, `utc_demo_token_northwind_docs`,
`utc_demo_token_horizon`).

## What's implemented vs. deferred

Matches the spec's own scope split:

- **Implemented (sections 6, 10, 12–14):** project discovery, programmatic
  Jest execution + coverage collection, an extensible static rule engine,
  package.json/migration analysis, a normalized report schema, a REST API
  with schema validation and scoped-token auth, and an authenticated
  admin/client dashboard with history, trends, and findings.
- **Deliberately left TBD, per section 20 of the spec:** backend/database
  technology (here: a JSON file store behind `lib/db.ts`, swappable for a
  real database without touching route handlers), the final build-injection
  mechanism (here: an explicit npm script wrapper, per section 15's
  recommended direction), the auth provider (here: a demo cookie session),
  and composite score weighting (here: a simple, replaceable formula in
  `audit-engine/src/report.js`).

## Interactivity & theming

- **Light/dark theme** — toggle button in the header (and login screen); the
  choice is stored in `localStorage` and applied before first paint (no
  flash). All colors run through CSS custom properties in `globals.css` plus
  `lib/theme-colors.ts` (for the Recharts trend line, which needs literal
  color strings rather than CSS variables), so both palettes stay in sync
  from one source.
- **Client list** (`components/ClientListPanel.tsx`) — live search, status
  filter chips, and sortable columns (name / score / coverage / last audit),
  fulfilling DASH-02's "search/filter clients."
- **Report history** (`components/ReportHistoryList.tsx`) — filter by
  trigger type or "critical/high findings only," toggleable sort order.
- **Findings** (`components/FindingsPanel.tsx`) — severity filter chips with
  live counts and collapsible rule-category groups, so a long findings list
  stays scannable.
- **Report sharing** (`components/CopyLinkButton.tsx`) — one-click copy of
  the current report's URL.

## Design notes

The dashboard uses a dark "audit console" visual language — signal colors
(pass/fail/warn/info) drive every status indicator so severity and coverage
bands read the same way everywhere, monospace type carries IDs/metrics, and
the score dial's radial fill echoes the coverage-band scoring model from
section 11.
