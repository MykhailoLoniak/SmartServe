# Production readiness checklist

- [x] Session-based authentication with an httpOnly cookie and server-side validation.
- [x] RBAC and permission mapping through `hasPermission` and `requirePermission`.
- [x] Tenant scoping in critical order, waiter, and restaurant-management actions.
- [x] Server-side payload validation for critical workflows.
- [x] Structured logging and an audit trail table.
- [x] Liveness at `/api/health` and database-aware readiness at `/api/ready`.
- [x] Security headers and CSP in `next.config.ts`.
- [x] Prisma migrations with no runtime `db push`.
- [ ] Complete Playwright E2E pipeline.
- [ ] Sentry SDK integration with `@sentry/nextjs` in the deployment environment.
- [x] GitHub Actions quality checks.
- [ ] Automated deployment migrations and rollback; the final platform workflow is not selected.
