# Deployment notes

## Мінімальний production flow

1. Встановити env (`.env`, `.env.local`/platform secrets).
2. Виконати міграції:

```bash
npm run prisma:migrate:deploy
```

3. Згенерувати Prisma client (якщо не зроблено в build step):

```bash
npm run prisma:generate
```

4. Зібрати застосунок:

```bash
npm run build
```

5. Запустити:

```bash
npm run start
```

## Важливо

- Не покладатися на `prisma db push` у production workflow.
- Обовʼязково налаштувати:
  - `SMARTSERVE_ADMIN_USERNAME/PASSWORD`
  - `SMARTSERVE_STAFF_USERNAME/PASSWORD`
- За потреби обмежити ресторани через `SMARTSERVE_*_RESTAURANTS`.
