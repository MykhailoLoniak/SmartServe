# Production readiness checklist

- [x] Session-based auth with httpOnly cookie and server-side validation.
- [x] RBAC + permission mapping (`hasPermission`, `requirePermission`).
- [x] Tenant scoping in critical actions (`orders`, `waiter`, `restaurant management`).
- [x] Server-side payload validation for critical flows.
- [x] Structured logging + audit trail table.
- [x] Health endpoint (`/api/health`).
- [x] Security headers + CSP in `next.config.ts`.
- [x] Prisma migrations (no runtime `db push`).
- [ ] Full E2E Playwright pipeline (blocked in current package policy).
- [ ] Real Sentry SDK wiring (`@sentry/nextjs`) in deploy environment.
- [ ] CI/CD migration-before-deploy and rollback automation.
