"use server";

import { getDayRange, getMonthRange, getPreviousMonthRange, getWeekRange, getYesterdayRange } from "@/lib/dateRanges";
import { getWeekLabel, toStatsRows, updateStatsBucket } from "@/lib/managerStats";
import { prisma } from "@/lib/prisma";
import { requireScopedRestaurantPermission } from "@/lib/restaurantScope";

import type { ManagerPeriod, ManagerStatsResponse } from "./types";

const getRangeByPeriod = (period: ManagerPeriod) => {
  switch (period) {
    case "today":
      return getDayRange();
    case "yesterday":
      return getYesterdayRange();
    case "week":
      return getWeekRange();
    case "previousMonth":
      return getPreviousMonthRange();
    default:
      return getMonthRange();
  }
};

const getDayLabel = (completedAt: Date) => completedAt.toLocaleDateString("en-US");

export async function getManagerStats(period: ManagerPeriod, scopedRestaurantId?: number): Promise<ManagerStatsResponse> {
  const restaurantId = await requireScopedRestaurantPermission("manage_menu", scopedRestaurantId);
  const { start, end } = getRangeByPeriod(period);

  const paidOrders = await prisma.order.findMany({
    where: {
      status: "PAID",
      table: {
        restaurantId,
      },
      completedAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      completedAt: true,
      totalPrice: true,
    },
    orderBy: {
      completedAt: "asc",
    },
  });

  const ordersCount = paidOrders.length;
  const revenue = paidOrders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
  const averageCheck = ordersCount > 0 ? revenue / ordersCount : 0;
  const byDaysMap = new Map<string, { ordersCount: number; revenue: number }>();
  const byWeeksMap = new Map<string, { ordersCount: number; revenue: number }>();

  paidOrders.forEach((order) => {
    if (!order.completedAt) {
      return;
    }

    const orderTotal = Number(order.totalPrice);
    const dayLabel = getDayLabel(order.completedAt);
    const weekLabel = getWeekLabel(order.completedAt);

    updateStatsBucket(byDaysMap, dayLabel, orderTotal);
    updateStatsBucket(byWeeksMap, weekLabel, orderTotal);
  });

  return {
    ordersCount,
    revenue,
    averageCheck,
    from: start.toISOString(),
    to: end.toISOString(),
    byDays: toStatsRows(byDaysMap),
    byWeeks: toStatsRows(byWeeksMap),
  };
}
