# Troubleshooting

## 401 на /admin або /staff

SmartServe використовує DB-backed session cookie, не Basic Auth. Перевірте активність користувача, запис `Session` та restaurant-scoped membership потрібної ролі.

## Не видно потрібний ресторан після логіну

Перевірте `UserRestaurantRole` та cookie активного ресторану. Server-side guard завжди повторно перевіряє membership.

## Проблеми з БД локально

Рекомендований порядок:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
npm run dev
```

`npm run prisma:db:push` використовуйте тільки явно і свідомо.
