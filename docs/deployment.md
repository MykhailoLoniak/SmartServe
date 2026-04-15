# Deployment документація (SmartServe)

## 1. Середовища

- **Local**: розробка на машині інженера.
- **Staging**: передпродакшн перевірки QA/UAT.
- **Production**: бойове середовище.

## 2. Мінімальні вимоги

- Node.js 20+
- PostgreSQL 14+
- ENV-конфіг для Next.js і Prisma

## 3. Змінні середовища

### 3.1 Frontend (docs/env.frontend.example)

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_KITCHEN_ACTIVE_STATUSES=PENDING,COOKING
NEXT_PUBLIC_KITCHEN_REFRESH_INTERVAL_MS=5000
```

### 3.2 Backend (docs/env.backend.example)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smartserve?schema=public
NODE_ENV=development
```

## 4. Кроки деплою

### 4.1 Build

```bash
npm ci
npm run lint
npm run build
```

### 4.2 Міграція/схема БД

```bash
npx prisma generate
npx prisma db push
```

Для першого запуску/оновлення демо-даних:

```bash
npx prisma db seed
```

### 4.3 Run

```bash
npm run start
```

## 5. CI/CD (рекомендований шаблон)

> [Потрібно уточнення] У репозиторії немає готового pipeline. Рекомендований мінімум:

1. `install` → `npm ci`
2. `lint` → `npm run lint`
3. `build` → `npm run build`
4. `db check` → `npx prisma validate`
5. `deploy` (manual approval для production)

## 6. Rollback strategy

1. Rollback застосунку до попереднього image/tag.
2. Якщо проблема в схемі БД:
   - при використанні migration-based flow — `prisma migrate resolve` + rollback migration;
   - при `db push` — ручне відновлення зі snapshot/backup.
3. Повернути ENV до попередньої стабільної версії.

## 7. Моніторинг (recommended)

- App logs (stdout) + error alerting.
- Health-check endpoint (додати при першій ітерації hardening).
- DB connection / latency метрики.
