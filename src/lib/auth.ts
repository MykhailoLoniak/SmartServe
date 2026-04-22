import crypto from "node:crypto";

import type { UserRole } from "@prisma/client";
import { cookies, headers } from "next/headers";

import { writeAuditLog } from "@/lib/audit";
import { forbidden, unauthorized } from "@/lib/errors";
import { logEvent } from "@/lib/logger";
import { getRolePermissions, hasPermission, type Permission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validation";

export type SmartServeRole = UserRole;

const SESSION_COOKIE_NAME = "smartserve_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;
const SESSION_RENEW_WINDOW_MS = 1000 * 60 * 30;

export type AuthSession = {
  userId: number;
  email: string;
  name: string;
  memberships: Array<{ restaurantId: number; role: UserRole }>;
};

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

const getSessionCookieOptions = (expiresAt: Date) => ({
  httpOnly: true as const,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  expires: expiresAt,
});

const clearSessionCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
};

export async function login(input: { email: string; password: string }) {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    throw unauthorized("Некоректний email або пароль");
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    include: {
      memberships: {
        select: {
          restaurantId: true,
          role: true,
        },
      },
    },
  });

  if (!user || !user.isActive) {
    await writeAuditLog({ action: "LOGIN_FAILED", entityType: "user", details: { email: parsed.data.email } });
    throw unauthorized("Некоректний email або пароль");
  }

  const isPasswordValid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!isPasswordValid) {
    await writeAuditLog({ action: "LOGIN_FAILED", entityType: "user", userId: user.id, details: { email: user.email } });
    throw unauthorized("Некоректний email або пароль");
  }

  const cookieStore = await cookies();
  const previousToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (previousToken) {
    await prisma.session.deleteMany({ where: { sessionToken: hashToken(previousToken) } });
  }

  const rawToken = crypto.randomUUID();
  const sessionToken = hashToken(rawToken);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);
  const reqHeaders = await headers();

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expiresAt,
      userAgent: reqHeaders.get("user-agent"),
      ipAddress: reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    },
  });

  cookieStore.set(SESSION_COOKIE_NAME, rawToken, getSessionCookieOptions(expiresAt));

  await writeAuditLog({ action: "LOGIN_SUCCESS", userId: user.id, entityType: "session" });
  logEvent("auth.login.success", { userId: user.id });
}

export async function logout() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (rawToken) {
    await prisma.session.deleteMany({ where: { sessionToken: hashToken(rawToken) } });
  }

  await clearSessionCookie();
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawToken) {
    return null;
  }

  const currentTokenHash = hashToken(rawToken);
  const session = await prisma.session.findUnique({
    where: { sessionToken: currentTokenHash },
    include: {
      user: {
        include: {
          memberships: {
            select: {
              restaurantId: true,
              role: true,
            },
          },
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date() || !session.user.isActive) {
    await clearSessionCookie();
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  const now = new Date();
  if (session.expiresAt.getTime() - now.getTime() <= SESSION_RENEW_WINDOW_MS) {
    const nextRawToken = crypto.randomUUID();
    const nextSessionToken = hashToken(nextRawToken);
    const nextExpiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

    await prisma.session.update({
      where: { id: session.id },
      data: {
        sessionToken: nextSessionToken,
        expiresAt: nextExpiresAt,
      },
    });

    cookieStore.set(SESSION_COOKIE_NAME, nextRawToken, getSessionCookieOptions(nextExpiresAt));
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    memberships: session.user.memberships,
  };
}

export async function requireAuth(roles?: SmartServeRole[]) {
  const session = await getAuthSession();

  if (!session) {
    throw unauthorized();
  }

  if (!roles || roles.length === 0) {
    return session;
  }

  const hasRole = session.memberships.some((membership) => roles.includes(membership.role));

  if (!hasRole) {
    throw forbidden();
  }

  return session;
}

export async function requireAnyPermission(permission: Permission) {
  const session = await requireAuth();
  const allowedMembership = session.memberships.find((membership) => hasPermission(membership.role, permission));

  if (!allowedMembership) {
    throw forbidden();
  }

  return { session, membership: allowedMembership };
}

export async function requireRestaurantAccess(restaurantId: number, roles?: SmartServeRole[], existingSession?: AuthSession) {
  const session = existingSession ?? (await requireAuth(roles));
  if (roles && roles.length > 0 && !session.memberships.some((membership) => roles.includes(membership.role))) {
    throw forbidden();
  }
  const membership = session.memberships.find((item) => item.restaurantId === restaurantId);

  if (!membership) {
    await writeAuditLog({
      action: "ACCESS_DENIED",
      userId: session.userId,
      restaurantId,
      entityType: "restaurant",
      entityId: String(restaurantId),
    });
    throw forbidden("Немає доступу до цього ресторану");
  }

  return { session, membership };
}

export async function requireRestaurantAccessBySlug(slug: string, roles?: SmartServeRole[]) {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug }, select: { id: true } });
  if (!restaurant) {
    throw forbidden("Ресторан не знайдено");
  }

  await requireRestaurantAccess(restaurant.id, roles);
}

export async function requireRestaurantPermissionBySlug(slug: string, permission: Permission) {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug }, select: { id: true } });
  if (!restaurant) {
    throw forbidden("Ресторан не знайдено");
  }

  return requirePermission(restaurant.id, permission);
}

export async function requireRestaurantAccessById(restaurantId: number, roles?: SmartServeRole[]) {
  await requireRestaurantAccess(restaurantId, roles);
}

export async function requireRole(restaurantId: number, roles: SmartServeRole[]) {
  const { membership } = await requireRestaurantAccess(restaurantId);
  if (!roles.includes(membership.role)) {
    throw forbidden();
  }

  return membership.role;
}

export async function requirePermission(restaurantId: number, permission: Permission, existingSession?: AuthSession) {
  const { session, membership } = await requireRestaurantAccess(restaurantId, undefined, existingSession);

  if (!hasPermission(membership.role, permission)) {
    await writeAuditLog({
      action: "ACCESS_DENIED",
      userId: session.userId,
      restaurantId,
      entityType: "permission",
      entityId: permission,
      details: { role: membership.role, permissions: getRolePermissions(membership.role) },
    });
    throw forbidden();
  }

  return { session, role: membership.role };
}
