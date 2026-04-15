"use server";

import { OrderStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type UpdateOrderStatusInput =
  | {
      orderId: number;
      status: OrderStatus;
      orderItemId?: never;
    }
  | {
      orderItemId: number;
      status: Exclude<OrderStatus, "PAID">;
      orderId?: never;
    };

const ORDER_STATUSES = new Set(Object.values(OrderStatus));
const ORDER_ITEM_STATUSES = new Set<OrderStatus>([OrderStatus.PENDING, OrderStatus.COOKING, OrderStatus.READY]);

const hasValidEntityId = (id: number | undefined) => Number.isInteger(id) && (id as number) > 0;

const isLegacyOrderItemSchemaError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2022";

const isValidInput = (input: UpdateOrderStatusInput) => {
  if (!ORDER_STATUSES.has(input.status)) {
    return false;
  }

  if ("orderId" in input) {
    return hasValidEntityId(input.orderId);
  }

  return hasValidEntityId(input.orderItemId) && ORDER_ITEM_STATUSES.has(input.status);
};

export async function updateOrderStatus(input: UpdateOrderStatusInput) {
  if (!isValidInput(input)) {
    throw new Error("Некоректні дані для оновлення статусу");
  }

  if ("orderId" in input) {
    await prisma.order.update({
      where: { id: input.orderId },
      data: { status: input.status },
    });

    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      const updatedItem = await tx.orderItem.update({
        where: { id: input.orderItemId },
        data: {
          status: input.status,
          startedAt: input.status === "COOKING" ? new Date() : undefined,
        },
        select: {
          orderId: true,
        },
      });

      const itemStatuses = await tx.orderItem.findMany({
        where: { orderId: updatedItem.orderId },
        select: { status: true },
      });

      const allReady = itemStatuses.every((item) => item.status === "READY");
      const hasCooking = itemStatuses.some((item) => item.status === "COOKING");

      await tx.order.update({
        where: { id: updatedItem.orderId },
        data: {
          status: allReady ? "READY" : hasCooking ? "COOKING" : "PENDING",
        },
      });
    });
  } catch (error) {
    if (!isLegacyOrderItemSchemaError(error)) {
      throw error;
    }

    const item = await prisma.orderItem.findUnique({
      where: { id: input.orderItemId },
      select: { orderId: true },
    });

    if (!item) {
      throw new Error("Позицію замовлення не знайдено");
    }

    await prisma.order.update({
      where: { id: item.orderId },
      data: { status: input.status },
    });
  }
}
