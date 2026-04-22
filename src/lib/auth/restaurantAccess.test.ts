import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";

import * as audit from "@/lib/audit";
import { AppError } from "@/lib/errors";

import * as authGuards from "./authGuards";
import * as authRepository from "./authRepository";
import {
  requireRestaurantAccess,
  requireRestaurantAccessBySlug,
  requireRole,
} from "./restaurantAccess";
import { createAuthSession, createMembership, createMembershipsForAOnly } from "./testFactories";

afterEach(() => {
  mock.restoreAll();
});

test("requireRestaurantAccess allows restaurant A and denies restaurant B", async () => {
  const session = createAuthSession({ memberships: createMembershipsForAOnly() });

  const accessA = await requireRestaurantAccess(10, undefined, session);
  assert.equal(accessA.membership.restaurantId, 10);

  mock.method(audit, "writeAuditLog", async () => undefined);
  await assert.rejects(() => requireRestaurantAccess(20, undefined, session), (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.code, "FORBIDDEN");
    return true;
  });
});

test("requireRole differentiates owner/admin/staff roles", async () => {
  const ownerSession = createAuthSession({ memberships: [createMembership({ restaurantId: 7, role: "OWNER" })] });
  const adminSession = createAuthSession({ memberships: [createMembership({ restaurantId: 7, role: "ADMIN" })] });
  const staffSession = createAuthSession({ memberships: [createMembership({ restaurantId: 7, role: "STAFF" })] });

  assert.equal((await requireRestaurantAccess(7, undefined, ownerSession)).membership.role, "OWNER");
  assert.equal((await requireRestaurantAccess(7, undefined, adminSession)).membership.role, "ADMIN");
  assert.equal((await requireRestaurantAccess(7, undefined, staffSession)).membership.role, "STAFF");

  assert.equal(await requireRole(7, ["OWNER", "ADMIN"]), "OWNER");

  mock.method(authGuards, "requireAuth", async () => staffSession);
  await assert.rejects(() => requireRole(7, ["OWNER", "ADMIN"]), (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.code, "FORBIDDEN");
    return true;
  });
});

test("requireRestaurantAccessBySlug fails for invalid slug", async () => {
  mock.method(authRepository, "findRestaurantIdBySlug", async () => null);

  await assert.rejects(() => requireRestaurantAccessBySlug("missing-slug"), (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.code, "FORBIDDEN");
    assert.equal(error.message, "Ресторан не знайдено");
    return true;
  });
});
