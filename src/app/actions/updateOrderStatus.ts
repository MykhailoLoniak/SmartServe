"use server";

import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/audit";
import { badRequest, notFound } from "@/lib/errors";
import { createRequestId, logEvent } from "@/lib/logger";
import { deriveOrderStatusByItems } from "@/lib/orderLogic";
import { prisma } from "@/lib/prisma";
import { requireScopedRestaurantAuthorization } from "@/lib/restaurantScope";
import { updateOrderStatusSchema } from "@/lib/validation";

const isLegacyOrderItemSchemaError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2022";

export async function updateOrderStatus(input: unknown, scopedRestaurantId?: number) {
  const requestId = createRequestId();
  const { restaurantId, session } = await requireScopedRestaurantAuthorization("manage_orders", scopedRestaurantId);

  const parsed = updateOrderStatusSchema.safeParse(input);
  if (!parsed.success) {
    throw badRequest("Некоректні дані для оновлення статусу", { issues: parsed.error.flatten(), requestId });
  }

  if ("orderId" in parsed.data) {
    const order = await prisma.order.findFirst({
      where: { id: parsed.data.orderId, table: { restaurantId } },
      select: { id: true, completedAt: true },
    });

    if (!order) {
      throw notFound("Замовлення не знайдено");
    }

    await prisma.order.update({
      where: { id: parsed.data.orderId },
      data: {
        status: parsed.data.status,
        completedAt: parsed.data.status === "PAID" ? (order.completedAt ?? new Date()) : order.completedAt,
        updatedById: session.userId,
        closedById: parsed.data.status === "PAID" ? session.userId : null,
      },
    });

    await writeAuditLog({
      action: "ORDER_STATUS_UPDATED",
      userId: session.userId,
      restaurantId,
      entityType: "order",
      entityId: String(parsed.data.orderId),
      requestId,
      details: { status: parsed.data.status },
    });
    logEvent("order.status.update", { requestId, restaurantId, orderId: parsed.data.orderId, status: parsed.data.status });
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      const itemRecord = await tx.orderItem.findFirst({
        where: { id: parsed.data.orderItemId, order: { table: { restaurantId } } },
        select: { id: true },
      });

      if (!itemRecord) {
        throw notFound("Позицію замовлення не знайдено");
      }

      const completionDate = parsed.data.status === "READY" ? new Date() : null;
      const updatedItem = await tx.orderItem.update({
        where: { id: parsed.data.orderItemId },
        data: {
          status: parsed.data.status,
          startedAt: parsed.data.status === "COOKING" ? new Date() : undefined,
          completedAt: parsed.data.status === "READY" ? completionDate : undefined,
        },
        select: { orderId: true },
      });

      const itemStatuses = await tx.orderItem.findMany({ where: { orderId: updatedItem.orderId }, select: { status: true } });
      const nextOrderStatus = deriveOrderStatusByItems(itemStatuses.map((item) => item.status));

      const existingOrder = await tx.order.findUnique({
        where: { id: updatedItem.orderId },
        select: { completedAt: true },
      });

      await tx.order.update({
        where: { id: updatedItem.orderId },
        data: {
          status: nextOrderStatus,
          completedAt: nextOrderStatus === "READY" ? (existingOrder?.completedAt ?? new Date()) : existingOrder?.completedAt ?? null,
          updatedById: session.userId,
        },
      });

      await writeAuditLog({
        action: "ORDER_STATUS_UPDATED",
        userId: session.userId,
        restaurantId,
        entityType: "order_item",
        entityId: String(parsed.data.orderItemId),
        requestId,
        details: { status: parsed.data.status },
      });
    });
  } catch (error) {
    if (!isLegacyOrderItemSchemaError(error)) {
      throw error;
    }
    throw badRequest("Схема позицій замовлення застаріла. Виконайте міграції.");
  }
}
