import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";

export async function findUserForLogin(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      memberships: {
        select: {
          restaurantId: true,
          role: true,
        },
      },
    },
  });
}

export async function deleteSessionByTokenHash(sessionToken: string) {
  return prisma.session.deleteMany({ where: { sessionToken } });
}

export async function findSessionByTokenHash(sessionToken: string) {
  return prisma.session.findUnique({
    where: { sessionToken },
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
}

export async function deleteSessionById(id: string) {
  return prisma.session.delete({ where: { id } });
}

export async function rotateSessionById(id: string, sessionToken: string, expiresAt: Date) {
  return prisma.session.update({
    where: { id },
    data: {
      sessionToken,
      expiresAt,
    },
  });
}

export async function createSession(input: { sessionToken: string; userId: number; expiresAt: Date }) {
  const reqHeaders = await headers();
  return prisma.session.create({
    data: {
      sessionToken: input.sessionToken,
      userId: input.userId,
      expiresAt: input.expiresAt,
      userAgent: reqHeaders.get("user-agent"),
      ipAddress: reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    },
  });
}

export async function findRestaurantIdBySlug(slug: string) {
  return prisma.restaurant.findUnique({ where: { slug }, select: { id: true } });
}
