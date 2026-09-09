# Troubleshooting

## 401 response on `/admin` or `/staff`

SmartServe uses a database-backed session cookie, not Basic Authentication. Check that the user is active, the `Session` record exists, and the user has a restaurant-scoped membership with the required role.

## The expected restaurant is missing after sign-in

Check `UserRestaurantRole` and the active-restaurant cookie. Server-side guards always verify membership again.

## Local database problems

Use this sequence:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
npm run dev
```

Only use `prisma db push` deliberately when you understand the schema implications.
