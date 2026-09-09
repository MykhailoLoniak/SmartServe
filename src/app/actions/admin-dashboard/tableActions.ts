"use server";

import { badRequest, conflict, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { requireScopedRestaurantPermission } from "@/lib/restaurantScope";
import { tableSchema } from "@/lib/validation";

import type { DashboardTable } from "./types";
import { ACTIVE_ORDER_STATUSES, parseIntField, revalidateAdminPaths } from "./shared";

export async function getTablesSnapshot(scopedRestaurantId?: number): Promise<DashboardTable[]> {
  const restaurantId = await requireScopedRestaurantPermission("manage_menu", scopedRestaurantId);

  const tables = await prisma.table.findMany({
    where: { restaurantId },
    orderBy: { number: "asc" },
    select: {
      id: true,
      number: true,
      orders: {
        where: {
          status: {
            in: ACTIVE_ORDER_STATUSES,
          },
        },
        select: { id: true },
      },
    },
  });

  return tables.map((table) => ({
    id: table.id,
    number: table.number,
    activeOrdersCount: table.orders.length,
  }));
}

export async function createTable(formData: FormData, scopedRestaurantId?: number): Promise<DashboardTable[]> {
  const parsedTable = tableSchema.safeParse({ number: parseIntField(formData.get("number")) });

  if (!parsedTable.success) {
    throw badRequest("Invalid table number.", { issues: parsedTable.error.flatten() });
  }

  const { number } = parsedTable.data;

  const restaurantId = await requireScopedRestaurantPermission("manage_menu", scopedRestaurantId);

  const duplicate = await prisma.table.findFirst({
    where: {
      restaurantId,
      number,
    },
    select: { id: true },
  });

  if (duplicate) {
    throw conflict("A table with this number already exists.");
  }

  await prisma.table.create({
    data: {
      restaurantId,
      number,
      qrSlug: crypto.randomUUID(),
    },
  });

  revalidateAdminPaths();
  return getTablesSnapshot(scopedRestaurantId);
}

export async function deleteTable(formData: FormData, scopedRestaurantId?: number): Promise<DashboardTable[]> {
  const restaurantId = await requireScopedRestaurantPermission("manage_menu", scopedRestaurantId);
  const forceDelete = formData.get("forceDelete") === "true";
  const parsedTable = tableSchema.safeParse({ tableId: parseIntField(formData.get("tableId")), forceDelete });

  if (!parsedTable.success || !parsedTable.data.tableId) {
    throw badRequest("Invalid table.", { issues: parsedTable.success ? { tableId: ["invalid"] } : parsedTable.error.flatten() });
  }

  const { tableId } = parsedTable.data;

  const table = await prisma.table.findFirst({
    where: {
      id: tableId,
      restaurantId,
    },
    select: { id: true },
  });

  if (!table) {
    throw notFound("Table not found for the selected restaurant.");
  }

  const activeOrdersCount = await prisma.order.count({
    where: {
      tableId,
      table: {
        restaurantId,
      },
      status: {
        in: ACTIVE_ORDER_STATUSES,
      },
    },
  });

  if (activeOrdersCount > 0 && !forceDelete) {
    throw conflict("The table has active orders. Confirm deletion.");
  }

  await prisma.table.delete({
    where: { id: tableId },
  });

  revalidateAdminPaths();
  return getTablesSnapshot(scopedRestaurantId);
}
