import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";

import { AppError } from "@/lib/errors";

import * as authGuards from "./authGuards";
import * as authSession from "./authSession";
import { createAuthSession, createMembership } from "./testFactories";

afterEach(() => {
  mock.restoreAll();
});

test("requireAuth throws UNAUTHORIZED when session is missing", async () => {
  mock.method(authSession, "getAuthSession", async () => null);

  await assert.rejects(() => authGuards.requireAuth(), (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.code, "UNAUTHORIZED");
    return true;
  });
});

test("requireAuth returns session when no role list is provided", async () => {
  const session = createAuthSession({ memberships: [createMembership({ role: "WAITER" })] });
  mock.method(authSession, "getAuthSession", async () => session);

  const actual = await authGuards.requireAuth();

  assert.deepEqual(actual, session);
});

test("requireAuth enforces role checks", async () => {
  const session = createAuthSession({ memberships: [createMembership({ role: "STAFF" })] });
  mock.method(authSession, "getAuthSession", async () => session);

  await assert.rejects(() => authGuards.requireAuth(["OWNER", "ADMIN"]), (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.code, "FORBIDDEN");
    return true;
  });
});
