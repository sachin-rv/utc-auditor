# UTC Auditor dashboard

Authenticated Next.js console for UTC Auditor. It talks to the Nest backend
(`utc-auditor-be`) over JWT and shows different views for **admin** and
**client** users.

```
utc-auditor/
├── app/                 Dashboard routes + auth/session BFF
├── components/          Console UI
└── lib/                 Backend client, session, report mapping
```

The dashboard does not store clients, projects, or reports itself. Those live
in the backend. See `utc-auditor-be/docs/API.md` for the HTTP contract.

## Prerequisites

- Node 18+
- Backend running at `http://localhost:3000` (or set `BACKEND_URL`)

Copy env:

```bash
cp .env.example .env.local
```

```env
BACKEND_URL=http://localhost:3000
```

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001). The Next app uses port
**3001** so it does not collide with the API on **3000**.

### First-run setup

If the backend has no users, the login screen becomes **Create the first
admin** (`GET /api/auth/setup-status`, `POST /api/auth/setup`). After that,
admin and client users share the same login UI (`POST /api/auth/login`).

## Roles

Same sign-in page; dashboard content depends on JWT `role`.

### Admin

- List / search clients (`GET /api/clients`)
- Create client (`POST /api/clients`)
- Create user (`POST /api/users`) — client user can be linked to an existing
  `clientId`, or the API can create an org from the email domain if `clientId`
  is omitted
- Add projects (`POST /api/clients/:id/projects`)
- Generate a project API key (`POST /api/projects/:id/api-keys`) — copy
  `plainKey` once; it is not shown again
- Open report history and the detailed quality dashboard

### Client

- Own projects only (`GET /api/projects`)
- Report history and detail for those projects
- No create-client / add-project / API-key actions

## Reports

List: `GET /api/projects/:projectId/reports`  
Detail: `GET /api/reports/:reportId` (Mongo `id` from the list, not library
`reportId`)

The **Detailed test-quality breakdown** page renders `reportJson` from the
API (quality score, CMS readiness, test completeness, static issues,
coverage).

Project lists support search, passing/failing filters, and expand/collapse.
Report history supports trigger filter, failing-only, and date/score sort.
The report view has Overview / Findings / JSON tabs.

## Report upload

Admins issue an API key per project. Reports are uploaded to the Nest API with:

```
X-API-Key: utc_...
POST /api/reports
```

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Dev server on port 3001        |
| `npm run build`| Production build               |
| `npm run start`| Start production server        |
| `npm run lint` | ESLint                         |

## Design

Dark/light audit-console theme (header + login toggle, `localStorage`).
Status uses pass / warn / fail / info signal colors. Modals handle create
flows, findings, and sign-out confirmation.
