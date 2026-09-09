import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";

import { AppError } from "@/lib/errors";
import { hasPermission } from "@/lib/permissions";

import * as audit from "@/lib/audit";
import * as authGuards from "./authGuards";
import * as authRepository from "./authRepository";
import * as restaurantAccess from "./restaurantAccess";
import { requireAnyPermission, requirePermission, requireRestaurantPermissionBySlug } from "./permissionGuards";
import { createAuthSession, createMembership } from "./testFactories";

afterEach(() => {
  mock.restoreAll();
});

test("requireAnyPermission returns first membership with needed permission", async () => {
  const session = createAuthSession({
    memberships: [
      createMembership({ role: "STAFF", restaurantId: 1 }),
      createMembership({ role: "ADMIN", restaurantId: 2 }),
    ],
  });
  mock.method(authGuards, "requireAuth", async () => session);

  const result = await requireAnyPermission("manage_users");

  assert.equal(result.membership.role, "ADMIN");
  assert.equal(hasPermission(result.membership.role, "manage_users"), true);
});

test("requirePermission denies when role has insufficient permission", async () => {
  const session = createAuthSession({ memberships: [createMembership({ role: "STAFF", restaurantId: 3 })] });
  mock.method(restaurantAccess, "requireRestaurantAccess", async () => ({
    session,
    membership: session.memberships[0],
  }));
  mock.method(audit, "writeAuditLog", async () => undefined);

  await assert.rejects(() => requirePermission(3, "manage_users"), (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.code, "FORBIDDEN");
    return true;
  });
});

test("requireRestaurantPermissionBySlug denies invalid restaurant slug", async () => {
  mock.method(authRepository, "findRestaurantIdBySlug", async () => null);

  await assert.rejects(() => requireRestaurantPermissionBySlug("nope", "manage_orders"), (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.code, "FORBIDDEN");
    assert.equal(error.message, "Restaurant not found");
    return true;
  });
});
