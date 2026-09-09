# 🍽️ SmartServe

SmartServe — вебсистема для ресторану: гість відкриває меню за QR-кодом столика й оформлює замовлення, кухня готує його, офіціант подає, а менеджер керує меню, столиками та статистикою.

**Онлайн-версія:** [smart-serve-eta.vercel.app](https://smart-serve-eta.vercel.app)

> Адміністративні сторінки захищені авторизацією. Репозиторій навмисно не містить логінів або паролів production-середовища.

## Як користуватися сайтом

### Гість

1. Відскануйте QR-код на столику. Не набирайте адресу столика вручну: вона містить унікальний токен, а не просто номер столу.
2. На сторінці меню натискайте **«Додати»** біля потрібних позицій.
3. Відкрийте кошик, змініть кількість страв і черговість подачі за потреби.
4. Перевірте номер столика та суму, потім натисніть кнопку оформлення замовлення.

Правильна гостьова адреса має вигляд:

```text
https://smart-serve-eta.vercel.app/<restaurant-slug>/table/<table-qr-token>
```

Посилання на кшталт `/smart-bistro/table/1` не працюватиме: остання частина — це захищений QR-токен, який створюється системою.

### Власник або адміністратор

1. Відкрийте [сторінку входу](https://smart-serve-eta.vercel.app/login).
2. Після входу перейдіть у **Керування ресторанами** й виберіть активний заклад. Вибір визначає, дані якого ресторану показують усі робочі панелі.
3. Використовуйте швидкі посилання:
   - **Панель менеджера** — активні замовлення, редактор меню, столики та статистика;
   - **QR-генератор** — готові посилання й QR-коди для столиків;
   - **Кабінет власника** — огляд продажів і показників;
   - **Кухня** та **Офіціант** — робочі екрани персоналу.
4. Спочатку створіть столики, потім відкрийте QR-генератор, виберіть столик і надрукуйте або збережіть отриманий QR-код.

### Кухня

1. Увійдіть під обліковим записом із доступом до потрібного ресторану.
2. Відкрийте сторінку **Кухня** через керування ресторанами.
3. Приймайте нові позиції в роботу та змінюйте їхній статус до готовності.

Дошка оновлюється автоматично. Якщо нове замовлення не з'явилося миттєво, зачекайте кілька секунд — базовий механізм оновлення працює через polling.

### Офіціант

1. Увійдіть і відкрийте сторінку **Офіціант** для активного ресторану.
2. Переглядайте готові замовлення, підтверджуйте подачу та закривайте рахунок після обслуговування.

## Швидкий локальний запуск

Потрібні Node.js 20+ і PostgreSQL.

```bash
git clone git@github.com:MykhailoLoniak/SmartServe.git
cd SmartServe
npm ci
cp .env.example .env
```

Заповніть у `.env` щонайменше `DATABASE_URL`, `DIRECT_URL` і `NEXT_PUBLIC_APP_URL`, після чого виконайте:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000). Локальний seed створює два демо-ресторани; облікові дані беруться зі змінних `SEED_ADMIN_EMAIL` і `SEED_ADMIN_PASSWORD` у вашому `.env`.

> `prisma:seed` призначений лише для development. Для одноразового створення production demo використовуйте захищений `npm run bootstrap:demo` за інструкцією в [docs/deployment.md](docs/deployment.md).

## Корисні команди

```bash
npm run dev          # development server
npm run lint         # ESLint
npm run typecheck    # перевірка TypeScript
npm test             # unit-тести
npm run build        # production build
```

## Маршрути

| Сценарій | Маршрут |
| --- | --- |
| Вхід | `/login` |
| Вибір ресторану | `/admin/restaurants` |
| Панель менеджера | `/<restaurant-slug>/admin/dashboard` |
| QR-коди столиків | `/<restaurant-slug>/admin/qr` |
| Кабінет власника | `/<restaurant-slug>/admin/owner` |
| Кухня | `/<restaurant-slug>/staff/kitchen` |
| Офіціант | `/<restaurant-slug>/staff/waiter` |
| Меню гостя | `/<restaurant-slug>/table/<table-qr-token>` |
| Перевірка застосунку | `/api/health` |
| Перевірка застосунку та БД | `/api/ready` |

Доступ до маршрутів залежить від ролі користувача та його прив'язки до ресторану.

## Технології

Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · Prisma · PostgreSQL · Zustand · session-based auth · polling з опційним Supabase Realtime.

Система multi-tenant: один deployment підтримує кілька ресторанів, а сервер перевіряє права користувача окремо для кожного закладу.

## Документація

- [Frontend](docs/frontend.md)
- [Backend](docs/backend.md)
- [API](docs/api.md)
- [Deployment](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Production readiness](docs/production-readiness.md)

## Стан проєкту

Проєкт активно розробляється. Unit-тести покривають основну бізнес-логіку, авторизацію та перевірку прав. Повноцінний браузерний E2E-набір і production error monitoring ще не підключені.

**Автор:** Mykhailo Loniak — [GitHub](https://github.com/MykhailoLoniak)
