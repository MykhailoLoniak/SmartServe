import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";

import { AppError } from "@/lib/errors";

import * as authCookies from "./authCookies";
import * as authHashing from "./authHashing";
import * as authRepository from "./authRepository";
import { requireAuth } from "./authGuards";
import { getAuthSession } from "./authSession";
import { requirePermission } from "./permissionGuards";
import { requireRestaurantAccessBySlug, requireRole } from "./restaurantAccess";
import { createAuthSession, createMembership } from "./testFactories";

afterEach(() => {
  mock.restoreAll();
});

test("integration: missing session is denied by requireAuth", async () => {
  mock.method(authCookies, "readSessionTokenFromCookie", async () => null);

  await assert.rejects(() => requireAuth(), (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.code, "UNAUTHORIZED");
    return true;
  });
});

test("integration: expired session is removed from DB and denied without cookie mutation", async () => {
  mock.method(authCookies, "readSessionTokenFromCookie", async () => "raw-token");
  mock.method(authHashing, "hashToken", () => "hash-token");
  mock.method(authRepository, "findSessionByTokenHash", async () => ({
    id: 11,
    expiresAt: new Date(Date.now() - 10_000),
    user: {
      id: 2,
      email: "expired@smartserve.test",
      name: "Expired",
      isActive: true,
      memberships: [createMembership({ restaurantId: 1, role: "ADMIN" })],
    },
  }));
  const clearCookie = mock.method(authCookies, "clearSessionCookie", async () => undefined);
  const deleteSession = mock.method(authRepository, "deleteSessionById", async () => undefined);

  const session = await getAuthSession();
  assert.equal(session, null);
  assert.equal(clearCookie.mock.callCount(), 0);
  assert.equal(deleteSession.mock.callCount(), 1);

  await assert.rejects(() => requireAuth(), (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.code, "UNAUTHORIZED");
    return true;
  });
});

test("integration: user with access to restaurant A but not B", async () => {
  const session = createAuthSession({ memberships: [createMembership({ restaurantId: 101, role: "ADMIN" })] });
  mock.method(authCookies, "readSessionTokenFromCookie", async () => "ok-token");
  mock.method(authHashing, "hashToken", () => "ok-hash");
  mock.method(authRepository, "findSessionByTokenHash", async () => ({
    id: 22,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    user: { id: session.userId, email: session.email, name: session.name, isActive: true, memberships: session.memberships },
  }));

  const allowed = await requirePermission(101, "manage_users");
  assert.equal(allowed.role, "ADMIN");

  await assert.rejects(() => requirePermission(202, "manage_orders"), (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.code, "FORBIDDEN");
    return true;
  });
});

test("integration: owner/admin/staff role differences", async () => {
  const ownerSession = createAuthSession({ memberships: [createMembership({ restaurantId: 44, role: "OWNER" })] });
  const adminSession = createAuthSession({ memberships: [createMembership({ restaurantId: 44, role: "ADMIN" })] });
  const staffSession = createAuthSession({ memberships: [createMembership({ restaurantId: 44, role: "STAFF" })] });

  assert.equal((await requirePermission(44, "manage_restaurant", ownerSession)).role, "OWNER");
  assert.equal((await requirePermission(44, "manage_users", adminSession)).role, "ADMIN");

  await assert.rejects(() => requirePermission(44, "manage_users", staffSession), (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.code, "FORBIDDEN");
    return true;
  });

  mock.method(authRepository, "findRestaurantIdBySlug", async () => ({ id: 44 }));
  mock.method(authCookies, "readSessionTokenFromCookie", async () => "owner-token");
  mock.method(authHashing, "hashToken", () => "owner-hash");
  mock.method(authRepository, "findSessionByTokenHash", async () => ({
    id: 999,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    user: { id: ownerSession.userId, email: ownerSession.email, name: ownerSession.name, isActive: true, memberships: ownerSession.memberships },
  }));

  await requireRestaurantAccessBySlug("restaurant-44", ["OWNER", "ADMIN"]);
  assert.equal(await requireRole(44, ["OWNER"]), "OWNER");
});

test("integration: invalid restaurant slug is denied", async () => {
  mock.method(authRepository, "findRestaurantIdBySlug", async () => null);

  await assert.rejects(() => requireRestaurantAccessBySlug("does-not-exist"), (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.code, "FORBIDDEN");
    return true;
  });
});

test("integration: insufficient permission is denied", async () => {
  const staffSession = createAuthSession({ memberships: [createMembership({ restaurantId: 50, role: "STAFF" })] });

  await assert.rejects(() => requirePermission(50, "manage_qr", staffSession), (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.code, "FORBIDDEN");
    return true;
  });
});
