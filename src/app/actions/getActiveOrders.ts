"use server";

import { Prisma, type OrderStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type KitchenItemStatus = Exclude<OrderStatus, "PAID">;

type OrderBoardMode = "active" | "completed";

export type ActiveKitchenOrder = {
  id: number;
  createdAt: string;
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

const getStartOfDay = () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

export async function getActiveOrders({ statuses, mode = "active" }: GetActiveOrdersInput): Promise<ActiveKitchenOrder[]> {
  const itemStatuses = Array.from(new Set([...statuses.filter(isKitchenItemStatus), "READY"]));

  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: statuses,
        },
        ...(mode === "completed"
          ? {
              createdAt: {
                gte: getStartOfDay(),
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
        ...(mode === "completed"
          ? {
              createdAt: {
                gte: getStartOfDay(),
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
