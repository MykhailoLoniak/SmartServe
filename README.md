# SmartServe

SmartServe — full-stack Next.js застосунок для QR-меню гостей, kitchen board, waiter board і admin/owner dashboard з multi-restaurant підтримкою через `restaurantSlug` + cookie активного ресторану.

## Quick start

### 1) Install

```bash
npm install
```

### 2) Environment

```bash
cp docs/env.frontend.example .env.local
cp docs/env.backend.example .env
```

Обовʼязково задайте auth credentials для захищених `/admin/*` та `/staff/*` маршрутів:

- `SMARTSERVE_ADMIN_USERNAME`
- `SMARTSERVE_ADMIN_PASSWORD`
- `SMARTSERVE_STAFF_USERNAME`
- `SMARTSERVE_STAFF_PASSWORD`

Опційно можна обмежити доступ до конкретних ресторанів за slug:

- `SMARTSERVE_ADMIN_RESTAURANTS` (`*` або `slug-a,slug-b`)
- `SMARTSERVE_STAFF_RESTAURANTS` (`*` або `slug-a,slug-b`)

### 3) Prisma workflow

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
```

> `npm run dev` більше **не** виконує `prisma db push` автоматично.

Якщо потрібен manual `db push` для локального експерименту:

```bash
npm run prisma:db:push
```

### 4) Run app

```bash
npm run dev
```

## Scripts

- `npm run dev` — generate Prisma client + Next dev.
- `npm run build` — production build.
- `npm run lint` — ESLint checks.
- `npm run test` — transpile unit tests + `node:test` run.
- `npm run prisma:generate` — Prisma client generation.
- `npm run prisma:migrate:dev` — local migrations.
- `npm run prisma:migrate:deploy` — apply migrations in deploy env.
- `npm run prisma:db:push` — explicit schema push (тільки коли свідомо потрібно).
- `npm run prisma:seed` — seed data.

## Docs

- [Frontend](docs/frontend.md)
- [Backend](docs/backend.md)
- [API](docs/api.md)
- [Deployment](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)
