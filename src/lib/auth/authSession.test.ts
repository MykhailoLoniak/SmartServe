import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";

import * as authCookies from "./authCookies";
import * as authHashing from "./authHashing";
import * as authRepository from "./authRepository";
import { getAuthSession, isSessionExpired, needsSessionRotation } from "./authSession";
import { SESSION_DURATION_MS, SESSION_RENEW_WINDOW_MS } from "./authTypes";

afterEach(() => {
  mock.restoreAll();
});

function createRepositorySession(expiresAt: Date, isActive = true) {
  return {
    id: 1,
    expiresAt,
    user: {
      id: 200,
      email: "session@smartserve.test",
      name: "Session User",
      isActive,
      memberships: [{ restaurantId: 10, role: "STAFF" as const }],
    },
  };
}

test("session expiration logic marks past timestamps as expired", () => {
  const now = new Date("2026-01-01T12:00:00.000Z");
  assert.equal(isSessionExpired(new Date("2026-01-01T11:59:59.000Z"), now), true);
  assert.equal(isSessionExpired(new Date("2026-01-01T12:00:01.000Z"), now), false);
});

test("session rotation logic triggers only in renew window", () => {
  const now = new Date("2026-01-01T12:00:00.000Z");
  const inRenewWindow = new Date(now.getTime() + SESSION_RENEW_WINDOW_MS - 1);
  const outsideRenewWindow = new Date(now.getTime() + SESSION_RENEW_WINDOW_MS + 1);

  assert.equal(needsSessionRotation(inRenewWindow, now), true);
  assert.equal(needsSessionRotation(outsideRenewWindow, now), false);
});

test("getAuthSession returns null when session is missing", async () => {
  mock.method(authCookies, "readSessionTokenFromCookie", async () => null);

  const session = await getAuthSession();

  assert.equal(session, null);
});

test("getAuthSession clears expired session", async () => {
  mock.method(authCookies, "readSessionTokenFromCookie", async () => "raw-token");
  mock.method(authHashing, "hashToken", () => "hash");
  mock.method(authRepository, "findSessionByTokenHash", async () => createRepositorySession(new Date(Date.now() - 1_000)));

  const clearCookie = mock.method(authCookies, "clearSessionCookie", async () => undefined);
  const deleteSession = mock.method(authRepository, "deleteSessionById", async () => undefined);

  const session = await getAuthSession();

  assert.equal(session, null);
  assert.equal(clearCookie.mock.callCount(), 1);
  assert.equal(deleteSession.mock.callCount(), 1);
});

test("getAuthSession rotates soon-to-expire session", async () => {
  const now = Date.now();
  const expiresSoon = new Date(now + SESSION_RENEW_WINDOW_MS - 5_000);

  mock.method(authCookies, "readSessionTokenFromCookie", async () => "raw-token");
  mock.method(authHashing, "hashToken", (value: string) => `hash-${value}`);
  mock.method(authRepository, "findSessionByTokenHash", async () => createRepositorySession(expiresSoon));
  mock.method(authHashing, "generateSessionToken", () => "new-raw-token");

  const rotateSession = mock.method(authRepository, "rotateSessionById", async () => undefined);
  const writeCookie = mock.method(authCookies, "writeSessionCookie", async () => undefined);

  const session = await getAuthSession();

  assert.ok(session);
  assert.equal(session.userId, 200);
  assert.equal(rotateSession.mock.callCount(), 1);
  assert.equal(writeCookie.mock.callCount(), 1);

  const rotateArgs = rotateSession.mock.calls[0].arguments;
  assert.equal(rotateArgs[0], 1);
  assert.equal(rotateArgs[1], "hash-new-raw-token");
  assert.ok(rotateArgs[2] instanceof Date);
  const expiresIn = (rotateArgs[2] as Date).getTime() - now;
  assert.ok(expiresIn <= SESSION_DURATION_MS + 5_000);
});
