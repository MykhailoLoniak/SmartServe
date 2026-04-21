"use server";

import { revalidatePath } from "next/cache";

import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/auth";
import { badRequest } from "@/lib/errors";
import { createRequestId, logEvent } from "@/lib/logger";
import { hasInProgressItems } from "@/lib/orderLogic";
import { prisma } from "@/lib/prisma";
import { requireScopedRestaurantPermission } from "@/lib/restaurantScope";
import { closeBillSchema } from "@/lib/validation";

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

export async function getWaiterTableReports(scopedRestaurantId?: number): Promise<WaiterTableReport[]> {
  const restaurantId = await requireScopedRestaurantPermission("manage_orders", scopedRestaurantId);

  const activeOrders = await prisma.order.findMany({
    where: { status: { in: ["PENDING", "COOKING", "READY"] }, table: { restaurantId } },
    orderBy: [{ table: { number: "asc" } }, { createdAt: "asc" }],
    select: {
      id: true,
      status: true,
      createdAt: true,
      tableId: true,
      table: { select: { number: true } },
      items: {
        orderBy: [{ status: "asc" }, { id: "asc" }],
        select: { id: true, quantity: true, priceAtTime: true, status: true, menuItem: { select: { name: true } } },
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

    existing.orders.push({ id: order.id, status: order.status, createdAt: order.createdAt.toISOString(), items: normalizedItems });
    existing.total += orderTotal;
    existing.hasInProgressItems ||= normalizedItems.some((item) => item.status !== "READY");
    existing.hasReadyItems ||= normalizedItems.some((item) => item.status === "READY");

    groupedByTable.set(order.tableId, existing);
  });

  return [...groupedByTable.values()];
}

export async function closeTableBill(tableId: number, scopedRestaurantId?: number) {
  const requestId = createRequestId();
  const restaurantId = await requireScopedRestaurantPermission("close_bill", scopedRestaurantId);
  const { session } = await requirePermission(restaurantId, "close_bill");
  const parsed = closeBillSchema.safeParse({ tableId });
  if (!parsed.success) {
    throw badRequest("Некоректний столик", { issues: parsed.error.flatten(), requestId });
  }

  await prisma.$transaction(async (tx) => {
    const activeOrders = await tx.order.findMany({
      where: { tableId: parsed.data.tableId, table: { restaurantId }, status: { in: ["PENDING", "COOKING", "READY"] } },
      select: { id: true, items: { select: { status: true } } },
    });

    if (activeOrders.length === 0) {
      throw badRequest("Немає активних замовлень для закриття");
    }

    if (hasInProgressItems(activeOrders)) {
      throw badRequest("Не всі позиції готові. Закриття рахунку неможливе.");
    }

    const orderIds = activeOrders.map((order) => order.id);
    const completedAt = new Date();

    await tx.orderItem.updateMany({ where: { orderId: { in: orderIds } }, data: { completedAt } });
    await tx.order.updateMany({
      where: { id: { in: orderIds } },
      data: { status: "PAID", completedAt, updatedById: session.userId, closedById: session.userId },
    });

    await writeAuditLog({
      action: "BILL_CLOSED",
      userId: session.userId,
      restaurantId,
      entityType: "table",
      entityId: String(parsed.data.tableId),
      requestId,
      details: { orderIds },
    });

    logEvent("bill.close", { requestId, restaurantId, tableId: parsed.data.tableId, orderIds });
  });

  revalidatePath("/staff/waiter");
  revalidatePath("/admin/dashboard");
  revalidatePath("/[restaurantSlug]/staff/waiter", "page");
  revalidatePath("/[restaurantSlug]/admin/dashboard", "page");
}
