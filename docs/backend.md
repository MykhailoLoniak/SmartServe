# Backend: Next.js Server Actions and Prisma

## Local setup

```bash
npm ci
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
npm run dev
```

## Prisma

- `npm run prisma:generate` generates Prisma Client.
- `npm run prisma:migrate:dev` applies migrations locally.
- `npm run prisma:migrate:deploy` applies migrations during deployment.

## Authentication and access guards

Protected routes include `/admin/*`, `/staff/*`, `/:restaurantSlug/admin/*`, and `/:restaurantSlug/staff/*`.

The server-side guard layer includes:

- `requireAuth`
- `requireRestaurantAccessBySlug`
- `requireRestaurantAccessById`
- `requireRestaurantId([...roles])`

The active-restaurant cookie is only selection context. Access is always checked again against the database-backed session and `UserRestaurantRole` membership.

## Key files

- `src/app/actions/*` — Server Action business logic.
- `src/lib/auth.ts` — authentication and role/access guards.
- `src/lib/restaurantContext.ts` — active restaurant context.
- `src/lib/orderLogic.ts` — pure order, status, and bill business rules.
- `prisma/schema.prisma` — database schema.
- `prisma/migrations/*` — database migrations.
