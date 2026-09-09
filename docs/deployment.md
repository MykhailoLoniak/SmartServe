# Deployment notes

## Minimum production flow

1. Copy the root `.env.example` values into platform secrets.
2. Apply migrations:

```bash
npm run prisma:migrate:deploy
```

3. Generate Prisma Client if this is not part of the build step:

```bash
npm run prisma:generate
```

4. Build the application:

```bash
npm run build
```

5. Start the application:

```bash
npm run start
```

## Important

- Do not use `prisma db push` in the production workflow.
- Do not run the development demo seed in production; it intentionally fails when `NODE_ENV=production`.
- For a new production demo database, copy `.env.example` to local `.env`, fill `DATABASE_URL`, `DIRECT_URL`, and `BOOTSTRAP_OWNER_*`, then run `npm run setup:demo` once. It applies migrations, creates an owner, two demo restaurants, tables, and an English menu, and refuses to overwrite an existing user or restaurant. Never add `BOOTSTRAP_*` variables to Vercel.
- `/api/health` provides liveness; `/api/ready` verifies application and database readiness.
- Monitoring is currently console-only; the Sentry SDK is not installed.
- Polling is the primary update path. Enable Supabase Realtime only if Supabase owns the same PostgreSQL database and RLS, grants, and publication settings have been verified. Supabase cannot subscribe to a separate Neon database.
