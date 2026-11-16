# SuccessHUB

Privacy-aware student support platform for one Indian university. The MVP uses rules and human review; it never automatically labels students.

## Stack

- Node.js, Express, TypeScript: simple typed HTTP API.
- React and Vite: fast, accessible web app foundation.
- PostgreSQL: relational privacy boundaries and auditability.
- Docker Compose: repeatable local database setup.
- LiveKit Cloud: recommended managed WebRTC provider for the interview module.
- Google Calendar: MVP calendar invitations.

## Run locally

```powershell
Copy-Item .env.example .env
docker compose up -d
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

API: http://localhost:4000/health  
Web app: http://localhost:5173  
OpenAPI UI: http://localhost:4000/api/docs

The seed data marks governance content as drafts. Production refuses to serve until required governance configurations are approved. Development may show drafts, but the UI must label them `DRAFT - not approved`.

## MVP governance gate

Required configuration keys are versioned in `governance_configs`: consent text, retention schedule, anonymisation method, and student messages. Consent rows retain the accepted text version. Small-group analytics must suppress groups below five students.

## Demo authentication

For local route testing, send `x-user-id`, `x-user-role`, and, for student routes, `x-student-id` headers. Replace this adapter with university SSO/OIDC before pilot.
