# Backend документація (SmartServe)

## 1. Огляд backend-частини

SmartServe реалізує backend-логіку всередині Next.js через:
- **Server Actions** для CRUD-операцій із замовленнями.
- **Prisma ORM** для доступу до PostgreSQL.

Це означає, що backend логіка співіснує в одному репозиторії з frontend.

## 2. Технологічний стек

- Runtime: Node.js (рекомендовано LTS 20+)
- Framework: Next.js 15
- ORM: Prisma 6
- DB: PostgreSQL
- Realtime: Supabase Realtime (WebSocket на клієнті)

## 3. Локальний запуск backend

```bash
npm install
cp docs/env.backend.example .env
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

## 4. Структура backend-логіки

- `src/lib/prisma.ts` — singleton PrismaClient.
- `src/app/actions/createOrder.ts` — створення замовлення + order items у транзакції.
- `src/app/actions/getActiveOrders.ts` — читання активних замовлень за статусами.
- `src/app/actions/updateOrderStatus.ts` — оновлення статусу замовлення.
- `prisma/schema.prisma` — модель даних.
- `prisma/seed.ts` — початкові дані (заклад, столики, меню).

## 5. Domain flow (Order lifecycle)

Типовий життєвий цикл:
1. `PENDING` — гість зробив замовлення.
2. `COOKING` — кухня взяла в роботу.
3. `READY` — кухня завершила.
4. `PAID` — офіціант позначив як подане/закрите.

> Примітка: у поточній реалізації `PAID` фактично використовується як фінальний “completed/served” стан.

## 6. Валідація та обробка помилок

- `createOrder` перевіряє валідність `tableId`, масиву item’ів, кількостей і цін.
- `updateOrderStatus` перевіряє ID і допустимі enum-статуси.
- У разі некоректних вхідних даних кидаються `Error` з повідомленнями.

## 7. Логування

- Prisma налаштована з `log: ["error"]`.
- Додаткове операційне логування можна розширити через middleware Prisma або observability layer.

## 8. Черги / кеш / фонові задачі

- Явних черг (BullMQ/RabbitMQ) немає.
- Явного кешу (Redis) немає.
- Background jobs не виявлено.

## 9. [Потрібно уточнення]

- У репозиторії немає окремого шару auth (JWT/session/RBAC). Поточні staff/admin сторінки доступні без явної авторизації на кодовому рівні.
- Відсутні міграції Prisma (`prisma/migrations/*`) — використовується `db push` підхід у прикладах.
