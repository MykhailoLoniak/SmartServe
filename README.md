# 🍽️ SmartServe

**Full-stack restaurant automation platform**: guests scan a QR code at their table and place an order — kitchen and waitstaff see it in real time, the owner gets analytics. Multi-tenant: one system serves multiple restaurants at once.

🔗 **Live demo:** [deployment link]
📹 **Demo video / GIF:** [short walkthrough across all 4 roles]

---

## Why this project

Restaurants typically either run orders on paper or pay for expensive enterprise software. SmartServe is a lightweight alternative: a QR menu instead of a printed one, realtime boards instead of shouting "order's up" across the kitchen, and sales stats without spreadsheets.

## Who uses what

| Role           | What they do                                                       | Page                               |
| -------------- | ------------------------------------------------------------------ | ---------------------------------- |
| 🍔 Guest       | Scans the table QR, browses the menu, places an order              | `/[restaurant]/table/[id]`         |
| 👨‍🍳 Kitchen     | Sees new orders in real time, updates status (preparing → ready)   | `/staff/kitchen`                   |
| 🧑‍💼 Waiter      | Sees ready orders, confirms serving, closes the bill               | `/staff/waiter`                    |
| 👑 Owner/admin | Manages menu and tables, generates QR codes, views sales analytics | `/admin/dashboard`, `/admin/owner` |

**[Screenshot or GIF: guest menu]**
**[Screenshot or GIF: kitchen board with realtime updates]**
**[Screenshot or GIF: admin dashboard with analytics]**

## Try it yourself

Demo credentials:

- Admin: `[email]` / `[password]`
- Kitchen staff: `[email]` / `[password]`
- Waiter: `[email]` / `[password]`

> Demo data resets daily / is synthetic, not real orders.

## Tech stack

**Frontend:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand (cart state with persistence)
**Backend:** Next.js Server Actions · Prisma ORM · PostgreSQL
**Realtime:** Supabase Realtime (WebSocket) with polling fallback
**Auth:** Custom session-based authentication — hashed session tokens (SHA-256), passwords via salted PBKDF2, `timingSafeEqual` for hash comparison, session rotation, audit log
**Testing:** unit tests on business logic (`node:test`) — auth guards, permissions, order logic, restaurant scope

## What I find technically interesting here

- **RBAC across 5 roles** (OWNER/ADMIN/STAFF/WAITER/KITCHEN) with a clear permission map and per-restaurant access control — not just "logged in / not", but granular, restaurant-scoped permissions.
- **Realtime without building WebSocket infra from scratch** — Supabase Realtime with a polling fallback, so kitchen and floor staff see new orders without reloading the page.
- **Business logic kept separate from the UI** — order pricing, dish status derivation, and restaurant access are pure functions, unit-tested independently of React or the database.
- **Multi-tenant architecture** via `restaurantSlug` in routes plus an active-restaurant cookie, with access checked against an allowlist on the server, not just in the UI.

## Running locally

```bash
npm install
cp docs/env.frontend.example .env.local
cp docs/env.backend.example .env
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
npm run dev
```

More detail: [Frontend](docs/frontend.md) · [Backend](docs/backend.md) · [API](docs/api.md) · [Deployment](docs/deployment.md)

## Project status

Actively in development. Honest open items (no sugarcoating):

- [ ] E2E tests (Playwright) — currently only business logic has unit test coverage
- [ ] Sentry SDK for production error monitoring
- [ ] CI/CD pipeline with automated migrations before deploy

---

**Author:** Mykhailo Loniak — [GitHub](https://github.com/MykhailoLoniak) · [LinkedIn]
