"use server";

import { revalidatePath } from "next/cache";

import { hasInProgressItems } from "@/lib/orderLogic";
import { prisma } from "@/lib/prisma";
import { requireRestaurantId } from "@/lib/restaurantContext";

type WaiterTableItem = {
  id: number;
  name: string;
  quantity: number;
  priceAtTime: number;
  status: "PENDING" | "COOKING" | "READY";
};

export type WaiterTableReport = {
  tableId: number;
  tableNumber: number;
  orders: {
    id: number;
    status: "PENDING" | "COOKING" | "READY";
    createdAt: string;
    items: WaiterTableItem[];
  }[];
  total: number;
  hasInProgressItems: boolean;
  hasReadyItems: boolean;
};

export async function getWaiterTableReports(): Promise<WaiterTableReport[]> {
  const restaurantId = await requireRestaurantId(["STAFF", "ADMIN"]);
  const activeOrders = await prisma.order.findMany({
    where: {
      status: {
        in: ["PENDING", "COOKING", "READY"],
      },
      table: {
        restaurantId,
      },
    },
    orderBy: [{ table: { number: "asc" } }, { createdAt: "asc" }],
    select: {
      id: true,
      status: true,
      createdAt: true,
      tableId: true,
      table: {
        select: {
          number: true,
        },
      },
      items: {
        orderBy: [{ status: "asc" }, { id: "asc" }],
        select: {
          id: true,
          quantity: true,
          priceAtTime: true,
          status: true,
          menuItem: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  const groupedByTable = new Map<number, WaiterTableReport>();

  activeOrders.forEach((order) => {
    const normalizedItems = order.items.map((item) => ({
      id: item.id,
      name: item.menuItem?.name ?? "Страва",
      quantity: item.quantity,
      priceAtTime: Number(item.priceAtTime),
      status: item.status,
    }));

    const existing = groupedByTable.get(order.tableId) ?? {
      tableId: order.tableId,
      tableNumber: order.table.number,
      orders: [],
      total: 0,
      hasInProgressItems: false,
      hasReadyItems: false,
    };

    const orderTotal = normalizedItems.reduce((sum, item) => sum + item.priceAtTime * item.quantity, 0);

    existing.orders.push({
      id: order.id,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      items: normalizedItems,
    });

    existing.total += orderTotal;
    existing.hasInProgressItems ||= normalizedItems.some((item) => item.status !== "READY");
    existing.hasReadyItems ||= normalizedItems.some((item) => item.status === "READY");

    groupedByTable.set(order.tableId, existing);
  });

  return [...groupedByTable.values()];
}

export async function closeTableBill(tableId: number) {
  const restaurantId = await requireRestaurantId(["STAFF", "ADMIN"]);
  if (!Number.isInteger(tableId) || tableId <= 0) {
    throw new Error("Некоректний столик");
  }

  await prisma.$transaction(async (tx) => {
    const activeOrders = await tx.order.findMany({
      where: {
        tableId,
        table: {
          restaurantId,
        },
        status: {
          in: ["PENDING", "COOKING", "READY"],
        },
      },
      select: {
        id: true,
        items: {
          select: {
            status: true,
          },
        },
      },
    });

    if (activeOrders.length === 0) {
      throw new Error("Немає активних замовлень для закриття");
    }

    if (hasInProgressItems(activeOrders)) {
      throw new Error("Не всі позиції готові. Закриття рахунку неможливе.");
    }

    const orderIds = activeOrders.map((order) => order.id);
    const completedAt = new Date();

    await tx.orderItem.updateMany({
      where: {
        orderId: { in: orderIds },
      },
      data: {
        completedAt,
      },
    });

    await tx.order.updateMany({
      where: {
        id: { in: orderIds },
      },
      data: {
        status: "PAID",
        completedAt,
      },
    });
  });

  revalidatePath("/staff/waiter");
  revalidatePath("/admin/dashboard");
  revalidatePath("/[restaurantSlug]/staff/waiter", "page");
  revalidatePath("/[restaurantSlug]/admin/dashboard", "page");
}
