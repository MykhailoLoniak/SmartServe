# Troubleshooting

## 401 на /admin або /staff

Перевірте, що задані env:
- `SMARTSERVE_ADMIN_USERNAME`
- `SMARTSERVE_ADMIN_PASSWORD`
- `SMARTSERVE_STAFF_USERNAME`
- `SMARTSERVE_STAFF_PASSWORD`

Та що браузер відправляє коректний Basic Auth.

## Не видно потрібний ресторан після логіну

Перевірте allowlist змінні:
- `SMARTSERVE_ADMIN_RESTAURANTS`
- `SMARTSERVE_STAFF_RESTAURANTS`

Формат: `*` або `slug-a,slug-b`.

## Проблеми з БД локально

Рекомендований порядок:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
npm run dev
```

`npm run prisma:db:push` використовуйте тільки явно і свідомо.
