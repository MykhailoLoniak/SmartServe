import { getActiveOrders } from "@/app/actions/getActiveOrders";
import { getDayRange } from "@/lib/dateRanges";
import { prisma } from "@/lib/prisma";

export const fetchOwnerDashboardData = async (restaurantId: number) => {
  const today = getDayRange();
  const [menuItems, activeOrders, completedOrders, paidOrdersToday] = await Promise.all([
    prisma.menuItem.findMany({
      where: {
        category: {
          restaurantId,
        },
      },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        price: true,
        isAvailable: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    }),
    getActiveOrders({ statuses: ["PENDING", "COOKING", "READY"], mode: "active", restaurantId }),
    getActiveOrders({ statuses: ["PAID"], mode: "completed", restaurantId }),
    prisma.order.findMany({
      where: {
        status: "PAID",
        table: {
          restaurantId,
        },
        completedAt: {
          gte: today.start,
          lte: today.end,
        },
      },
      select: {
        id: true,
        totalPrice: true,
        items: {
          select: {
            quantity: true,
            priceAtTime: true,
            menuItem: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    menuItems,
    activeOrders,
    completedOrders,
    paidOrdersToday,
  };
};

export type OwnerDashboardData = Awaited<ReturnType<typeof fetchOwnerDashboardData>>;
