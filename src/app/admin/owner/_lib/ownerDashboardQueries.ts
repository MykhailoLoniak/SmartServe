import { getActiveOrders } from "@/app/actions/getActiveOrders";
import { prisma } from "@/lib/prisma";

const getStartOfToday = () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return startOfToday;
};

export const fetchOwnerDashboardData = async (restaurantId: number) => {
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
        createdAt: {
          gte: getStartOfToday(),
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
