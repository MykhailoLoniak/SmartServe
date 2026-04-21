import { cookies } from "next/headers";

import { requireAuth, requirePermission, requireRestaurantAccessById, type SmartServeRole } from "@/lib/auth";
import { forbidden } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const RESTAURANT_COOKIE_KEY = "smartserve_restaurant_id";

const parseRestaurantId = (value: string | undefined) => {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export async function getRestaurantsList() {
  const session = await requireAuth();

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

export async function getActiveRestaurant() {
  const restaurants = await getRestaurantsList();
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

export async function requireRestaurantId(roles?: SmartServeRole[]) {
  const { selectedRestaurantId } = await getActiveRestaurant();

  if (!selectedRestaurantId) {
    throw forbidden("Немає жодного доступного ресторану");
  }

  await requireRestaurantAccessById(selectedRestaurantId, roles);

  return selectedRestaurantId;
}

export async function requireRestaurantPermission(permission: Parameters<typeof requirePermission>[1]) {
  const restaurantId = await requireRestaurantId();
  await requirePermission(restaurantId, permission);
  return restaurantId;
}
