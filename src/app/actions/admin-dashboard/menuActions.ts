"use server";

import { badRequest, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { requireScopedRestaurantPermission } from "@/lib/restaurantScope";
import { menuItemSchema } from "@/lib/validation";

import type { DashboardMenuItem } from "./types";
import { parseIntField, parseMenuItemPayload, revalidateAdminPaths } from "./shared";

export const getMenuItemsSnapshot = async (scopedRestaurantId?: number): Promise<DashboardMenuItem[]> => {
  const restaurantId = await requireScopedRestaurantPermission("manage_menu", scopedRestaurantId);
  const items = await prisma.menuItem.findMany({
    where: {
      category: {
        restaurantId,
      },
    },
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

export async function createMenuItem(formData: FormData, scopedRestaurantId?: number): Promise<DashboardMenuItem[]> {
  const restaurantId = await requireScopedRestaurantPermission("manage_menu", scopedRestaurantId);
  const parsedPayload = menuItemSchema.safeParse(parseMenuItemPayload(formData));
  if (!parsedPayload.success) {
    throw badRequest("Перевірте дані страви перед збереженням.", { issues: parsedPayload.error.flatten() });
  }

  const { name, description, price, categoryId, estimatedTime } = parsedPayload.data;

  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      restaurantId,
    },
    select: { id: true },
  });

  if (!category) {
    throw notFound("Категорія не знайдена для обраного закладу.");
  }

  await prisma.menuItem.create({
    data: {
      name,
      description,
      price,
      categoryId,
      estimatedTime,
      isAvailable: true,
    },
  });

  revalidateAdminPaths();
  return getMenuItemsSnapshot(scopedRestaurantId);
}

export async function updateMenuItem(formData: FormData, scopedRestaurantId?: number): Promise<DashboardMenuItem[]> {
  const restaurantId = await requireScopedRestaurantPermission("manage_menu", scopedRestaurantId);
  const id = parseIntField(formData.get("id"));
  const parsedPayload = menuItemSchema.safeParse({ ...parseMenuItemPayload(formData), id: id ?? undefined });

  if (!parsedPayload.success || !id) {
    throw badRequest("Перевірте дані страви перед оновленням.", {
      issues: parsedPayload.success ? { id: ["invalid"] } : parsedPayload.error.flatten(),
    });
  }

  const { name, description, price, categoryId, estimatedTime } = parsedPayload.data;

  const [existingItem, category] = await Promise.all([
    prisma.menuItem.findFirst({
      where: {
        id,
        category: {
          restaurantId,
        },
      },
      select: { id: true },
    }),
    prisma.category.findFirst({
      where: {
        id: categoryId,
        restaurantId,
      },
      select: { id: true },
    }),
  ]);

  if (!existingItem) {
    throw notFound("Страва не знайдена для обраного закладу.");
  }

  if (!category) {
    throw notFound("Категорія не знайдена для обраного закладу.");
  }

  await prisma.menuItem.update({
    where: { id },
    data: {
      name,
      description,
      price,
      categoryId,
      estimatedTime,
    },
  });

  revalidateAdminPaths();
  return getMenuItemsSnapshot(scopedRestaurantId);
}

export async function deleteMenuItem(formData: FormData, scopedRestaurantId?: number): Promise<DashboardMenuItem[]> {
  const restaurantId = await requireScopedRestaurantPermission("manage_menu", scopedRestaurantId);
  const id = parseIntField(formData.get("id"));

  if (!id) {
    throw badRequest("Некоректний ID страви.");
  }

  const existingItem = await prisma.menuItem.findFirst({
    where: {
      id,
      category: {
        restaurantId,
      },
    },
    select: { id: true },
  });

  if (!existingItem) {
    throw notFound("Страва не знайдена для обраного закладу.");
  }

  await prisma.menuItem.delete({
    where: { id },
  });

  revalidateAdminPaths();
  return getMenuItemsSnapshot(scopedRestaurantId);
}

export async function toggleMenuItemAvailability(formData: FormData, scopedRestaurantId?: number): Promise<DashboardMenuItem[]> {
  const restaurantId = await requireScopedRestaurantPermission("manage_menu", scopedRestaurantId);
  const id = parseIntField(formData.get("id"));
  const isAvailable = formData.get("isAvailable") === "true";

  if (!id) {
    throw badRequest("Некоректний ID страви.");
  }

  const existingItem = await prisma.menuItem.findFirst({
    where: {
      id,
      category: {
        restaurantId,
      },
    },
    select: { id: true },
  });

  if (!existingItem) {
    throw notFound("Страва не знайдена для обраного закладу.");
  }

  await prisma.menuItem.update({
    where: { id },
    data: { isAvailable },
  });

  revalidateAdminPaths();
  return getMenuItemsSnapshot(scopedRestaurantId);
}
