# Deployment notes

## Мінімальний production flow

1. Скопіювати root `.env.example` і встановити platform secrets.
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
- Не запускати demo seed у production; він навмисно завершується помилкою при `NODE_ENV=production`.
- Для нової demo DB виконай один раз `npm run bootstrap:demo` з локального trusted terminal. Команда потребує явні `BOOTSTRAP_*` variables, створює owner, два demo ресторани, столи та англомовне меню, і відмовляється перезаписувати наявного користувача або ресторан. Ніколи не додавай `BOOTSTRAP_*` до Vercel.
- `/api/health` — liveness, `/api/ready` — DB-aware readiness.
- Monitoring зараз console-only: Sentry SDK не встановлено.
- Polling є основним update path. Supabase Realtime вмикається лише коли Supabase володіє тією самою PostgreSQL DB та перевірені RLS/grants/publication; Supabase не може слухати окрему Neon DB.
