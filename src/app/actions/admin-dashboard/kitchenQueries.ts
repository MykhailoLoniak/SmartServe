"use server";

import { prisma } from "@/lib/prisma";
import { requireScopedRestaurantPermission } from "@/lib/restaurantScope";

import type { DashboardCookingItem } from "./types";

export async function getCookingItems(scopedRestaurantId?: number): Promise<DashboardCookingItem[]> {
  const now = Date.now();
  const restaurantId = await requireScopedRestaurantPermission("manage_menu", scopedRestaurantId);

  const cookingItems = await prisma.orderItem.findMany({
    where: {
      status: "COOKING",
      order: {
        table: {
          restaurantId,
        },
      },
    },
    orderBy: [{ startedAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      quantity: true,
      startedAt: true,
      order: {
        select: {
          id: true,
          createdAt: true,
          table: {
            select: {
              number: true,
            },
          },
        },
      },
      menuItem: {
        select: {
          name: true,
          estimatedTime: true,
        },
      },
    },
  });

  return cookingItems.map((item) => {
    const startedAtIso = item.startedAt?.toISOString() ?? null;
    const elapsedMinutes = item.startedAt ? Math.max(0, Math.floor((now - item.startedAt.getTime()) / 60000)) : 0;

    return {
      orderItemId: item.id,
      orderId: item.order.id,
      quantity: item.quantity,
      startedAt: startedAtIso,
      elapsedMinutes,
      estimatedTime: item.menuItem.estimatedTime,
      status: "COOKING" as const,
      menuItemName: item.menuItem.name,
      tableNumber: item.order.table.number,
      createdAt: item.order.createdAt.toISOString(),
    };
  });
}
