# SmartServe

SmartServe — це full-stack вебзастосунок для цифровізації ресторанного обслуговування: QR-меню для гостей, операційна панель кухні, екран офіціанта та сторінки менеджера/власника.

## Швидкий старт

### 1) Встановлення залежностей

```bash
npm install
```

### 2) Налаштування середовища

Скопіюйте приклади змінних та заповніть значення:

```bash
cp docs/env.frontend.example .env.local
cp docs/env.backend.example .env
```

### 3) Підготовка БД

```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

> Якщо `npm run prisma:seed` недоступна у вашому `package.json`, використайте:
>
> ```bash
> npx prisma db seed
> ```

### 4) Запуск застосунку

```bash
npm run dev
```

Після запуску відкрийте:
- `http://localhost:3000` — головна сторінка.
- `http://localhost:3000/table/1` — гостьове меню столика.
- `http://localhost:3000/staff/kitchen` — кухня.
- `http://localhost:3000/staff/waiter` — офіціант.
- `http://localhost:3000/admin/dashboard` — менеджерська панель.
- `http://localhost:3000/admin/owner` — кабінет власника.
- `http://localhost:3000/admin/qr` — генератор QR-посилань.

## Документація

- [Frontend документація](docs/frontend.md)
- [Backend документація](docs/backend.md)
- [API документація](docs/api.md)
- [Deployment документація](docs/deployment.md)
- [Troubleshooting / FAQ](docs/troubleshooting.md)

## [Потрібно уточнення]

- У поточному репозиторії немає явного поділу на окремі frontend/backend сервіси: це єдиний Next.js-проєкт з `App Router` та `Server Actions`.
- В `package.json` відсутні скрипти тестування та сіду (`test`, `prisma:seed`) — у документації наведено рекомендовані команди та fallback-варіанти.
- Відсутній CI/CD конфіг (GitHub Actions/GitLab CI), тому в deployment-документації додано рекомендований базовий pipeline.
