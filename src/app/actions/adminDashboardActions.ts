"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

const DASHBOARD_PATH = "/admin/dashboard";

const parseIntField = (value: FormDataEntryValue | null, fallback?: number) => {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parsePrice = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(",", ".").trim();
  const parsed = Number.parseFloat(normalized);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const getRequiredString = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

export type DashboardMenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  estimatedTime: number;
  isAvailable: boolean;
  categoryId: number;
  categoryName: string;
};

const getMenuItemsSnapshot = async (): Promise<DashboardMenuItem[]> => {
  const items = await prisma.menuItem.findMany({
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      estimatedTime: true,
      isAvailable: true,
      categoryId: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    estimatedTime: item.estimatedTime,
    isAvailable: item.isAvailable,
    categoryId: item.categoryId,
    categoryName: item.category.name,
  }));
};

export async function createMenuItem(formData: FormData): Promise<DashboardMenuItem[]> {
  const name = getRequiredString(formData.get("name"));
  const descriptionEntry = formData.get("description");
  const description = typeof descriptionEntry === "string" ? descriptionEntry.trim() : "";
  const price = parsePrice(formData.get("price"));
  const categoryId = parseIntField(formData.get("categoryId"));
  const estimatedTime = parseIntField(formData.get("estimatedTime"), 15);

  if (!name || !price || !categoryId || !estimatedTime || estimatedTime < 1) {
    throw new Error("Перевірте дані страви перед збереженням.");
  }

  await prisma.menuItem.create({
    data: {
      name,
      description: description || null,
      price,
      categoryId,
      estimatedTime,
      isAvailable: true,
    },
  });

  revalidatePath(DASHBOARD_PATH);
  return getMenuItemsSnapshot();
}

export async function updateMenuItem(formData: FormData): Promise<DashboardMenuItem[]> {
  const id = parseIntField(formData.get("id"));
  const name = getRequiredString(formData.get("name"));
  const descriptionEntry = formData.get("description");
  const description = typeof descriptionEntry === "string" ? descriptionEntry.trim() : "";
  const price = parsePrice(formData.get("price"));
  const categoryId = parseIntField(formData.get("categoryId"));
  const estimatedTime = parseIntField(formData.get("estimatedTime"), 15);

  if (!id || !name || !price || !categoryId || !estimatedTime || estimatedTime < 1) {
    throw new Error("Перевірте дані страви перед оновленням.");
  }

  await prisma.menuItem.update({
    where: { id },
    data: {
      name,
      description: description || null,
      price,
      categoryId,
      estimatedTime,
    },
  });

  revalidatePath(DASHBOARD_PATH);
  return getMenuItemsSnapshot();
}

export async function deleteMenuItem(formData: FormData): Promise<DashboardMenuItem[]> {
  const id = parseIntField(formData.get("id"));

  if (!id) {
    throw new Error("Некоректний ID страви.");
  }

  await prisma.menuItem.delete({
    where: { id },
  });

  revalidatePath(DASHBOARD_PATH);
  return getMenuItemsSnapshot();
}

export async function toggleMenuItemAvailability(formData: FormData): Promise<DashboardMenuItem[]> {
  const id = parseIntField(formData.get("id"));
  const isAvailable = formData.get("isAvailable") === "true";

  if (!id) {
    throw new Error("Некоректний ID страви.");
  }

  await prisma.menuItem.update({
    where: { id },
    data: { isAvailable },
  });

  revalidatePath(DASHBOARD_PATH);
  return getMenuItemsSnapshot();
}

export type DashboardCookingItem = {
  orderItemId: number;
  orderId: number;
  quantity: number;
  startedAt: string | null;
  elapsedMinutes: number;
  estimatedTime: number;
  status: "COOKING";
  menuItemName: string;
  tableNumber: number;
  createdAt: string;
};

export async function getCookingItems(): Promise<DashboardCookingItem[]> {
  const now = Date.now();

  const cookingItems = await prisma.orderItem.findMany({
    where: {
      status: "COOKING",
    },
    orderBy: [{ startedAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      quantity: true,
      startedAt: true,
      order: {
        select: {
          id: true,
          createdAt: true,
          table: {
            select: {
              number: true,
            },
          },
        },
      },
      menuItem: {
        select: {
          name: true,
          estimatedTime: true,
        },
      },
    },
  });

  return cookingItems.map((item) => {
    const startedAtIso = item.startedAt?.toISOString() ?? null;
    const elapsedMinutes = item.startedAt ? Math.max(0, Math.floor((now - item.startedAt.getTime()) / 60000)) : 0;

    return {
      orderItemId: item.id,
      orderId: item.order.id,
      quantity: item.quantity,
      startedAt: startedAtIso,
      elapsedMinutes,
      estimatedTime: item.menuItem.estimatedTime,
      status: "COOKING" as const,
      menuItemName: item.menuItem.name,
      tableNumber: item.order.table.number,
      createdAt: item.order.createdAt.toISOString(),
    };
  });
}
