import { writeAuditLog } from "@/lib/audit";
import { unauthorized } from "@/lib/errors";
import { logEvent } from "@/lib/logger";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validation";

import { clearSessionCookie, readSessionTokenFromCookie, writeSessionCookie } from "./authCookies";
import { createSession, deleteSessionById, deleteSessionByTokenHash, findSessionByTokenHash, findUserForLogin, rotateSessionById } from "./authRepository";
import { generateSessionToken, hashToken } from "./authHashing";
import { SESSION_DURATION_MS, SESSION_RENEW_WINDOW_MS, type AuthSession } from "./authTypes";

const isSessionExpired = (expiresAt: Date, now: Date = new Date()) => expiresAt <= now;

const needsSessionRotation = (expiresAt: Date, now: Date = new Date()) => expiresAt.getTime() - now.getTime() <= SESSION_RENEW_WINDOW_MS;

export async function login(input: { email: string; password: string }) {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    throw unauthorized("Некоректний email або пароль");
  }

  const user = await findUserForLogin(parsed.data.email);

  if (!user || !user.isActive) {
    await writeAuditLog({ action: "LOGIN_FAILED", entityType: "user", details: { email: parsed.data.email } });
    throw unauthorized("Некоректний email або пароль");
  }

  const isPasswordValid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!isPasswordValid) {
    await writeAuditLog({ action: "LOGIN_FAILED", entityType: "user", userId: user.id, details: { email: user.email } });
    throw unauthorized("Некоректний email або пароль");
  }

  const previousRawToken = await readSessionTokenFromCookie();
  if (previousRawToken) {
    await deleteSessionByTokenHash(hashToken(previousRawToken));
  }

  const rawToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await createSession({
    sessionToken: hashToken(rawToken),
    userId: user.id,
    expiresAt,
  });

  await writeSessionCookie(rawToken, expiresAt);

  await writeAuditLog({ action: "LOGIN_SUCCESS", userId: user.id, entityType: "session" });
  logEvent("auth.login.success", { userId: user.id });
}

export async function logout() {
  const rawToken = await readSessionTokenFromCookie();

  if (rawToken) {
    await deleteSessionByTokenHash(hashToken(rawToken));
  }

  await clearSessionCookie();
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const rawToken = await readSessionTokenFromCookie();

  if (!rawToken) {
    return null;
  }

  const session = await findSessionByTokenHash(hashToken(rawToken));

  if (!session || isSessionExpired(session.expiresAt) || !session.user.isActive) {
    await clearSessionCookie();
    if (session) {
      await deleteSessionById(session.id);
    }
    return null;
  }

  if (needsSessionRotation(session.expiresAt)) {
    const nextRawToken = generateSessionToken();
    const nextExpiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await rotateSessionById(session.id, hashToken(nextRawToken), nextExpiresAt);
    await writeSessionCookie(nextRawToken, nextExpiresAt);
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    memberships: session.user.memberships,
  };
}
