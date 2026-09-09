"use server";

import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/audit";
import { badRequest, notFound } from "@/lib/errors";
import { createRequestId } from "@/lib/logger";
import { canTransitionOrderItemStatus, canTransitionOrderStatus, deriveOrderStatusByItems } from "@/lib/orderLogic";
import { prisma } from "@/lib/prisma";
import { requireScopedRestaurantAuthorization } from "@/lib/restaurantScope";
import { updateOrderStatusSchema } from "@/lib/validation";

const isLegacyOrderItemSchemaError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2022";

export async function updateOrderStatus(input: unknown, scopedRestaurantId?: number) {
  const requestId = createRequestId();
  const { restaurantId, session } = await requireScopedRestaurantAuthorization("update_kitchen_status", scopedRestaurantId);

  const parsed = updateOrderStatusSchema.safeParse(input);
  if (!parsed.success) {
    throw badRequest("Invalid status update data", { issues: parsed.error.flatten(), requestId });
  }

  if ("orderId" in parsed.data) {
    throw badRequest("Order status cannot be changed through the kitchen action", { requestId });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const itemRecord = await tx.orderItem.findFirst({
        where: { id: parsed.data.orderItemId, order: { table: { restaurantId } } },
        select: { id: true, status: true },
      });

      if (!itemRecord) {
        throw notFound("Order item not found");
      }

      if (!canTransitionOrderItemStatus(itemRecord.status, parsed.data.status)) {
        throw badRequest(`Invalid order item status transition: ${itemRecord.status} → ${parsed.data.status}`, { requestId });
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
        select: { status: true, completedAt: true },
      });

      if (!existingOrder) {
        throw notFound("Order not found");
      }

      if (!canTransitionOrderStatus(existingOrder.status, nextOrderStatus)) {
        throw badRequest(`Invalid order status transition: ${existingOrder.status} → ${nextOrderStatus}`, { requestId });
      }

      await tx.order.update({
        where: { id: updatedItem.orderId },
        data: {
          status: nextOrderStatus,
          completedAt: nextOrderStatus === "READY" ? (existingOrder.completedAt ?? new Date()) : existingOrder.completedAt,
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
      }, tx);
    });
  } catch (error) {
    if (!isLegacyOrderItemSchemaError(error)) {
      throw error;
    }
    throw badRequest("The order item schema is outdated. Run the migrations.");
  }
}
