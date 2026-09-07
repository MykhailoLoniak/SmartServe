"use server";

import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/audit";
import { calculateOrderTotal, priceOrderItems, type OrderDraftItem } from "@/lib/orderLogic";
import { badRequest, notFound } from "@/lib/errors";
import { createRequestId, logEvent } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validation";

type CreateOrderItemInput = OrderDraftItem;

type CreateOrderInput = {
  tableToken: string;
  idempotencyKey: string;
  items: CreateOrderItemInput[];
};

export async function createOrder(input: CreateOrderInput) {
  const requestId = createRequestId();
  const parsed = createOrderSchema.safeParse(input);

  if (!parsed.success) {
    throw badRequest("Некоректні дані замовлення", { issues: parsed.error.flatten(), requestId });
  }

  const { tableToken, idempotencyKey, items } = parsed.data;

  const createOrderTransaction = () => prisma.$transaction(async (tx) => {
    const table = await tx.table.findUnique({ where: { qrSlug: tableToken }, select: { id: true, restaurantId: true } });
    if (!table) throw notFound("Стіл не знайдено");

    const existingOrder = await tx.order.findUnique({
      where: { tableId_clientRequestId: { tableId: table.id, clientRequestId: idempotencyKey } },
      select: { id: true },
    });
    if (existingOrder) return { ...existingOrder, restaurantId: table.restaurantId, tableId: table.id };

    const menuItemIds = [...new Set(items.map((item) => item.menuItemId))];
    const availableMenuItems = await tx.menuItem.findMany({
      where: { id: { in: menuItemIds }, isAvailable: true, category: { restaurantId: table.restaurantId } },
      select: { id: true, price: true },
    });
    if (availableMenuItems.length !== menuItemIds.length) throw badRequest("У замовленні є недоступні позиції");

    const normalizedItems = priceOrderItems(items, new Map(availableMenuItems.map((item) => [item.id, Number(item.price)])));
    const totalPrice = calculateOrderTotal(normalizedItems);
    const createdOrder = await tx.order.create({
      data: {
        tableId: table.id,
        clientRequestId: idempotencyKey,
        status: "PENDING",
        totalPrice,
      },
    });

    await tx.orderItem.createMany({
      data: normalizedItems.map((item) => ({
        orderId: createdOrder.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        priceAtTime: item.priceAtTime,
        course: item.course,
      })),
    });

    await writeAuditLog({
      action: "ORDER_CREATED",
      restaurantId: table.restaurantId,
      entityType: "order",
      entityId: String(createdOrder.id),
      requestId,
      details: { tableId: table.id, itemCount: normalizedItems.length },
    }, tx);

    return { ...createdOrder, restaurantId: table.restaurantId };
  });

  let order: Awaited<ReturnType<typeof createOrderTransaction>>;
  try {
    order = await createOrderTransaction();
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    const existing = await prisma.order.findFirst({
      where: { clientRequestId: idempotencyKey, table: { qrSlug: tableToken } },
      select: { id: true, tableId: true, table: { select: { restaurantId: true } } },
    });
    if (!existing) throw error;
    order = { id: existing.id, tableId: existing.tableId, restaurantId: existing.table.restaurantId } as typeof order;
  }

  logEvent("order.create", { requestId, orderId: order.id, restaurantId: order.restaurantId, tableId: order.tableId });
  return { orderId: order.id };
}
