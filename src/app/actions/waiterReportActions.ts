"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

import { writeAuditLog } from "@/lib/audit";
import { badRequest, notFound } from "@/lib/errors";
import { createRequestId, logEvent } from "@/lib/logger";
import { hasInProgressItems } from "@/lib/orderLogic";
import { prisma } from "@/lib/prisma";
import { requireScopedRestaurantAuthorization, requireScopedRestaurantPermission } from "@/lib/restaurantScope";
import { closeBillSchema, idSchema } from "@/lib/validation";

type ActiveOrderStatus = "PENDING" | "COOKING" | "READY";
type WaiterItemStatus = "PENDING" | "COOKING" | "READY" | "SERVED";
const ACTIVE_ORDER_STATUSES: ActiveOrderStatus[] = ["PENDING", "COOKING", "READY"];

type WaiterTableItem = {
  id: number;
  name: string;
  quantity: number;
  priceAtTime: number;
  status: WaiterItemStatus;
  requiresKitchen: boolean;
};

export type WaiterTableReport = {
  tableId: number;
  tableNumber: number;
  orders: {
    id: number;
    status: ActiveOrderStatus;
    createdAt: string;
    items: WaiterTableItem[];
  }[];
  total: number;
  hasInProgressItems: boolean;
  hasReadyItems: boolean;
};

export type ClosedOrderDetails = {
  id: number;
  tableNumber: number;
  status: OrderStatus;
  createdAt: string;
  closedAt: string | null;
  paymentStatus: "PAID" | "UNPAID";
  total: number;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    priceAtTime: number;
    total: number;
    status: WaiterItemStatus;
  }>;
};

const revalidateWaiterPaths = () => {
  revalidatePath("/staff/waiter");
  revalidatePath("/admin/dashboard");
  revalidatePath("/[restaurantSlug]/staff/waiter", "page");
  revalidatePath("/[restaurantSlug]/admin/dashboard", "page");
};

export async function getWaiterTableReports(scopedRestaurantId?: number): Promise<WaiterTableReport[]> {
  const restaurantId = await requireScopedRestaurantPermission("manage_orders", scopedRestaurantId);

  const activeOrders = await prisma.order.findMany({
    where: { status: { in: ACTIVE_ORDER_STATUSES }, table: { restaurantId } },
    orderBy: [{ table: { number: "asc" } }, { createdAt: "asc" }],
    select: {
      id: true,
      status: true,
      createdAt: true,
      tableId: true,
      table: { select: { number: true } },
      items: {
        orderBy: [{ status: "asc" }, { id: "asc" }],
        select: { id: true, quantity: true, priceAtTime: true, status: true, menuItem: { select: { name: true, requiresKitchen: true } } },
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
      status: item.status as WaiterItemStatus,
      requiresKitchen: item.menuItem?.requiresKitchen ?? true,
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

    existing.orders.push({ id: order.id, status: order.status as ActiveOrderStatus, createdAt: order.createdAt.toISOString(), items: normalizedItems });
    existing.total += orderTotal;
    existing.hasInProgressItems ||= normalizedItems.some((item) => item.status !== "SERVED");
    existing.hasReadyItems ||= normalizedItems.some((item) => item.status === "READY" || (!item.requiresKitchen && item.status !== "SERVED"));

    groupedByTable.set(order.tableId, existing);
  });

  return [...groupedByTable.values()];
}

export async function getClosedOrderDetails(orderId: number, scopedRestaurantId?: number): Promise<ClosedOrderDetails> {
  const restaurantId = await requireScopedRestaurantPermission("close_bill", scopedRestaurantId);
  const parsedOrderId = idSchema.safeParse(orderId);

  if (!parsedOrderId.success) {
    throw badRequest("Некоректний ідентифікатор замовлення", { issues: parsedOrderId.error.flatten() });
  }

  const order = await prisma.order.findFirst({
    where: { id: parsedOrderId.data, table: { restaurantId }, status: "PAID" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      completedAt: true,
      totalPrice: true,
      table: { select: { number: true } },
      items: {
        orderBy: { id: "asc" },
        select: { id: true, quantity: true, priceAtTime: true, status: true, menuItem: { select: { name: true } } },
      },
    },
  });

  if (!order) {
    throw notFound("Закрите замовлення не знайдено");
  }

  return {
    id: order.id,
    tableNumber: order.table.number,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    closedAt: order.completedAt ? order.completedAt.toISOString() : null,
    paymentStatus: order.status === "PAID" ? "PAID" : "UNPAID",
    total: Number(order.totalPrice),
    items: order.items.map((item) => ({
      id: item.id,
      name: item.menuItem?.name ?? "Страва",
      quantity: item.quantity,
      priceAtTime: Number(item.priceAtTime),
      total: Number(item.priceAtTime) * item.quantity,
      status: item.status as WaiterItemStatus,
    })),
  };
}

export async function markOrderItemServed(orderItemId: number, scopedRestaurantId?: number): Promise<WaiterTableReport[]> {
  const requestId = createRequestId();
  const { restaurantId, session } = await requireScopedRestaurantAuthorization("close_bill", scopedRestaurantId);

  const parsed = idSchema.safeParse(orderItemId);
  if (!parsed.success) {
    throw badRequest("Некоректна позиція замовлення", { issues: parsed.error.flatten(), requestId });
  }

  await prisma.$transaction(async (tx) => {
    const item = await tx.orderItem.findFirst({
      where: { id: parsed.data, order: { table: { restaurantId }, status: { in: ACTIVE_ORDER_STATUSES } } },
      select: {
        id: true,
        status: true,
        completedAt: true,
        orderId: true,
        order: {
          select: {
            completedAt: true,
          },
        },
        menuItem: {
          select: {
            requiresKitchen: true,
          },
        },
      },
    });

    if (!item) {
      throw notFound("Позицію замовлення не знайдено");
    }

    if (item.status === "SERVED") {
      return;
    }

    const canServeKitchenItem = item.menuItem?.requiresKitchen ? item.status === "READY" : true;
    if (!canServeKitchenItem) {
      throw badRequest("Позицію можна подати лише після готовності кухні");
    }

    await tx.orderItem.update({
      where: { id: item.id },
      data: { status: "SERVED", completedAt: item.completedAt ?? new Date() },
    });

    const statuses = await tx.orderItem.findMany({ where: { orderId: item.orderId }, select: { status: true } });
    const isFullyServed = statuses.every((statusRecord) => statusRecord.status === "SERVED");

    await tx.order.update({
      where: { id: item.orderId },
      data: {
        status: isFullyServed ? "READY" : "COOKING",
        completedAt: item.order.completedAt ?? (isFullyServed ? new Date() : null),
        updatedById: session.userId,
      },
    });

    await writeAuditLog({
      action: "ORDER_STATUS_UPDATED",
      userId: session.userId,
      restaurantId,
      entityType: "order_item",
      entityId: String(item.id),
      requestId,
      details: { status: "SERVED" },
    });

    logEvent("waiter.item.served", { requestId, restaurantId, orderItemId: item.id, orderId: item.orderId, userId: session.userId });
  });

  revalidateWaiterPaths();
  return getWaiterTableReports(restaurantId);
}

export async function closeTableBill(tableId: number, scopedRestaurantId?: number) {
  const requestId = createRequestId();
  const { restaurantId, session } = await requireScopedRestaurantAuthorization("close_bill", scopedRestaurantId);
  const parsed = closeBillSchema.safeParse({ tableId });
  if (!parsed.success) {
    throw badRequest("Некоректний столик", { issues: parsed.error.flatten(), requestId });
  }

  await prisma.$transaction(async (tx) => {
    const activeOrders = await tx.order.findMany({
      where: { tableId: parsed.data.tableId, table: { restaurantId }, status: { in: ACTIVE_ORDER_STATUSES } },
      select: { id: true, items: { select: { status: true } } },
    });

    if (activeOrders.length === 0) {
      throw badRequest("Немає активних замовлень для закриття");
    }

    if (hasInProgressItems(activeOrders)) {
      throw badRequest("Не всі позиції подані. Закриття рахунку неможливе.");
    }

    const orderIds = activeOrders.map((order) => order.id);
    const completedAt = new Date();

    await tx.orderItem.updateMany({ where: { orderId: { in: orderIds }, completedAt: null }, data: { completedAt } });
    await tx.order.updateMany({
      where: { id: { in: orderIds }, completedAt: null },
      data: { status: "PAID", completedAt, updatedById: session.userId, closedById: session.userId },
    });
    await tx.order.updateMany({
      where: { id: { in: orderIds }, completedAt: { not: null } },
      data: { status: "PAID", updatedById: session.userId, closedById: session.userId },
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

  revalidateWaiterPaths();
}
