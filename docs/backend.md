# Backend (Next.js Server Actions + Prisma)

## Локальний запуск

```bash
npm install
cp docs/env.backend.example .env
cp docs/env.frontend.example .env.local
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
npm run dev
```

## Prisma

- `npm run prisma:generate` — генерує Prisma Client.
- `npm run prisma:migrate:dev` — локальні міграції.
- `npm run prisma:migrate:deploy` — застосування міграцій у deploy.
- `npm run prisma:db:push` — **лише явний** manual push (не вбудований у `npm run dev`).

## Auth / Access guards

Захищені маршрути: `/admin/*`, `/staff/*`, `/:restaurantSlug/admin/*`, `/:restaurantSlug/staff/*`.

Використовується базовий server-side guard layer:
- `requireAuth`
- `requireRestaurantAccessBySlug`
- `requireRestaurantAccessById`
- `requireRestaurantId([...roles])`

Cookie активного ресторану використовується лише як контекст вибору, але доступ перевіряється по auth credentials та allowlist ресторанів.

## Ключові файли

- `src/app/actions/*` — бізнес-логіка server actions.
- `src/lib/auth.ts` — auth + role/access guards.
- `src/lib/restaurantContext.ts` — active restaurant context.
- `src/lib/orderLogic.ts` — pure бізнес-логіка для order/status/bill rules.
- `prisma/schema.prisma` — схема БД.
- `prisma/migrations/*` — міграції.
