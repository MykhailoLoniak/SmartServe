"use server";

import { Prisma, type OrderStatus } from "@prisma/client";

import { getDayRange } from "@/lib/dateRanges";
import { prisma } from "@/lib/prisma";
import { requireRestaurantPermission } from "@/lib/restaurantContext";

type KitchenItemStatus = Exclude<OrderStatus, "PAID">;

type OrderBoardMode = "active" | "completed";

export type ActiveKitchenOrder = {
  id: number;
  createdAt: string;
  completedAt: string | null;
  status: OrderStatus;
  tableNumber: number;
  items: {
    id: number;
    quantity: number;
    priceAtTime: number;
    course: number;
    status: KitchenItemStatus;
    startedAt: string | null;
    menuItem: {
      name: string;
    } | null;
  }[];
};

type GetActiveOrdersInput = {
  statuses: OrderStatus[];
  mode?: OrderBoardMode;
};

const isKitchenItemStatus = (status: OrderStatus): status is KitchenItemStatus => status !== "PAID";

const isLegacyOrderItemSchemaError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2022";

const normalizeLegacyItemStatus = (status: OrderStatus): KitchenItemStatus =>
  status === "PAID" ? "READY" : status;

export async function getActiveOrders({ statuses, mode = "active" }: GetActiveOrdersInput): Promise<ActiveKitchenOrder[]> {
  const restaurantId = await requireRestaurantPermission("manage_orders");
  const itemStatuses = Array.from(new Set([...statuses.filter(isKitchenItemStatus), "READY"]));
  const { start: dayStart, end: dayEnd } = getDayRange();

  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: statuses,
        },
        table: {
          restaurantId,
        },
        ...(mode === "completed"
          ? {
              completedAt: {
                gte: dayStart,
                lte: dayEnd,
              },
            }
          : {}),
      },
      orderBy: {
        createdAt: mode === "completed" ? "desc" : "asc",
      },
      include: {
        table: true,
        items: {
          where: {
            status: {
              in: itemStatuses,
            },
          },
          select: {
            id: true,
            quantity: true,
            priceAtTime: true,
            course: true,
            status: true,
            startedAt: true,
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      createdAt: order.createdAt.toISOString(),
      completedAt: order.completedAt ? order.completedAt.toISOString() : null,
      status: order.status,
      tableNumber: order.table.number,
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        priceAtTime: Number(item.priceAtTime),
        course: item.course,
        status: item.status as KitchenItemStatus,
        startedAt: item.startedAt ? item.startedAt.toISOString() : null,
        menuItem: item.menuItem,
      })),
    }));
  } catch (error) {
    if (!isLegacyOrderItemSchemaError(error)) {
      throw error;
    }

    const legacyOrders = await prisma.order.findMany({
      where: {
        status: {
          in: statuses,
        },
        table: {
          restaurantId,
        },
        ...(mode === "completed"
          ? {
              completedAt: {
                gte: dayStart,
                lte: dayEnd,
              },
            }
          : {}),
      },
      orderBy: {
        createdAt: mode === "completed" ? "desc" : "asc",
      },
      include: {
        table: true,
        items: {
          select: {
            id: true,
            quantity: true,
            priceAtTime: true,
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return legacyOrders.map((order) => ({
      id: order.id,
      createdAt: order.createdAt.toISOString(),
      completedAt: order.completedAt ? order.completedAt.toISOString() : null,
      status: order.status,
      tableNumber: order.table.number,
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        priceAtTime: Number(item.priceAtTime),
        course: 1,
        status: normalizeLegacyItemStatus(order.status),
        startedAt: null,
        menuItem: item.menuItem,
      })),
    }));
  }
}
