import { cookies } from "next/headers";

import {
  requireAuth,
  requirePermission,
  requireRestaurantAccessById,
  type SmartServeRole,
} from "@/lib/auth";
import { forbidden } from "@/lib/errors";
import type { Permission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const RESTAURANT_COOKIE_KEY = "smartserve_restaurant_id";

const parseRestaurantId = (value: string | undefined) => {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export async function getRestaurantsList(existingSession?: Awaited<ReturnType<typeof requireAuth>>) {
  const session = existingSession ?? (await requireAuth());

  return prisma.restaurant.findMany({
    where: {
      memberships: {
        some: {
          userId: session.userId,
        },
      },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
    },
  });
}

export async function getActiveRestaurant(existingSession?: Awaited<ReturnType<typeof requireAuth>>) {
  const restaurants = await getRestaurantsList(existingSession);
  const cookieStore = await cookies();
  const preferredId = parseRestaurantId(cookieStore.get(RESTAURANT_COOKIE_KEY)?.value);
  const selectedRestaurant =
    (preferredId ? restaurants.find((restaurant) => restaurant.id === preferredId) : null) ?? restaurants[0] ?? null;

  return {
    restaurants,
    selectedRestaurant,
    selectedRestaurantId: selectedRestaurant?.id ?? null,
  };
}

export async function requireRestaurantId(roles?: SmartServeRole[], existingSession?: Awaited<ReturnType<typeof requireAuth>>) {
  const session = existingSession ?? (await requireAuth(roles));
  const { selectedRestaurantId } = await getActiveRestaurant(session);

  if (!selectedRestaurantId) {
    throw forbidden("Немає жодного доступного ресторану");
  }

  await requireRestaurantAccessById(selectedRestaurantId, roles);

  return selectedRestaurantId;
}

export async function requireRestaurantPermission(permission: Parameters<typeof requirePermission>[1]) {
  const session = await requireAuth();
  const restaurantId = await requireRestaurantId(undefined, session);
  await requirePermission(restaurantId, permission, session);
  return restaurantId;
}

export type RestaurantSlugContext = {
  restaurantId: number;
  restaurantSlug: string;
};

export async function getRestaurantContextBySlug(slug: string): Promise<RestaurantSlugContext> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: { id: true, slug: true },
  });

  if (!restaurant) {
    throw forbidden("Ресторан не знайдено");
  }

  await requireRestaurantAccessById(restaurant.id);

  return {
    restaurantId: restaurant.id,
    restaurantSlug: restaurant.slug,
  };
}

export async function requireRestaurantPermissionForSlug(slug: string, permission: Permission): Promise<RestaurantSlugContext> {
  const context = await getRestaurantContextBySlug(slug);
  await requirePermission(context.restaurantId, permission);
  return context;
}
