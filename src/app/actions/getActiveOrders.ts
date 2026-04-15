"use server";

import { type OrderStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type KitchenItemStatus = Exclude<OrderStatus, "PAID">;

export type ActiveKitchenOrder = {
  id: number;
  createdAt: string;
  status: OrderStatus;
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
};

const isKitchenItemStatus = (status: OrderStatus): status is KitchenItemStatus => status !== "PAID";

export async function getActiveOrders({ statuses }: GetActiveOrdersInput): Promise<ActiveKitchenOrder[]> {
  const itemStatuses = statuses.filter(isKitchenItemStatus);

  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          status: {
            in: itemStatuses,
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      createdAt: true,
      status: true,
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
}
