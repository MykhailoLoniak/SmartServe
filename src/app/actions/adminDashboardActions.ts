"use server";

import { revalidatePath } from "next/cache";

import { getDayRange, getMonthRange, getPreviousMonthRange, getWeekRange, getYesterdayRange } from "@/lib/dateRanges";
import { getWeekLabel, toStatsRows, updateStatsBucket } from "@/lib/managerStats";
import { prisma } from "@/lib/prisma";
import { requireRestaurantId } from "@/lib/restaurantContext";

const DASHBOARD_PATH = "/admin/dashboard";
const QR_PATH = "/admin/qr";
const DYNAMIC_DASHBOARD_PATH = "/[restaurantSlug]/admin/dashboard";
const DYNAMIC_QR_PATH = "/[restaurantSlug]/admin/qr";
const DEFAULT_ESTIMATED_TIME_MINUTES = 15;
const ACTIVE_ORDER_STATUSES = ["PENDING", "COOKING", "READY"] as const;

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

const revalidateAdminPaths = () => {
  revalidatePath(DASHBOARD_PATH);
  revalidatePath(QR_PATH);
  revalidatePath(DYNAMIC_DASHBOARD_PATH, "page");
  revalidatePath(DYNAMIC_QR_PATH, "page");
};

const parseMenuItemPayload = (formData: FormData) => {
  const name = getRequiredString(formData.get("name"));
  const descriptionEntry = formData.get("description");
  const description = typeof descriptionEntry === "string" ? descriptionEntry.trim() : "";
  const price = parsePrice(formData.get("price"));
  const categoryId = parseIntField(formData.get("categoryId"));
  const estimatedTime = parseIntField(formData.get("estimatedTime"), DEFAULT_ESTIMATED_TIME_MINUTES);

  return {
    name,
    description: description || null,
    price,
    categoryId,
    estimatedTime,
  };
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
  const restaurantId = await requireRestaurantId();
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

export async function createMenuItem(formData: FormData): Promise<DashboardMenuItem[]> {
  const restaurantId = await requireRestaurantId();
  const { name, description, price, categoryId, estimatedTime } = parseMenuItemPayload(formData);

  if (!name || !price || !categoryId || !estimatedTime || estimatedTime < 1) {
    throw new Error("Перевірте дані страви перед збереженням.");
  }

  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      restaurantId,
    },
    select: { id: true },
  });

  if (!category) {
    throw new Error("Категорія не знайдена для обраного закладу.");
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
  return getMenuItemsSnapshot();
}

export async function updateMenuItem(formData: FormData): Promise<DashboardMenuItem[]> {
  const restaurantId = await requireRestaurantId();
  const id = parseIntField(formData.get("id"));
  const { name, description, price, categoryId, estimatedTime } = parseMenuItemPayload(formData);

  if (!id || !name || !price || !categoryId || !estimatedTime || estimatedTime < 1) {
    throw new Error("Перевірте дані страви перед оновленням.");
  }

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
    throw new Error("Страва не знайдена для обраного закладу.");
  }

  if (!category) {
    throw new Error("Категорія не знайдена для обраного закладу.");
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
  return getMenuItemsSnapshot();
}

export async function deleteMenuItem(formData: FormData): Promise<DashboardMenuItem[]> {
  const restaurantId = await requireRestaurantId();
  const id = parseIntField(formData.get("id"));

  if (!id) {
    throw new Error("Некоректний ID страви.");
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
    throw new Error("Страва не знайдена для обраного закладу.");
  }

  await prisma.menuItem.delete({
    where: { id },
  });

  revalidateAdminPaths();
  return getMenuItemsSnapshot();
}

export async function toggleMenuItemAvailability(formData: FormData): Promise<DashboardMenuItem[]> {
  const restaurantId = await requireRestaurantId();
  const id = parseIntField(formData.get("id"));
  const isAvailable = formData.get("isAvailable") === "true";

  if (!id) {
    throw new Error("Некоректний ID страви.");
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
    throw new Error("Страва не знайдена для обраного закладу.");
  }

  await prisma.menuItem.update({
    where: { id },
    data: { isAvailable },
  });

  revalidateAdminPaths();
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
  const restaurantId = await requireRestaurantId();

  const cookingItems = await prisma.orderItem.findMany({
    where: {
      status: "COOKING",
      order: {
        table: {
          restaurantId,
        },
      },
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

export type DashboardTable = {
  id: number;
  number: number;
  activeOrdersCount: number;
};

export async function getTablesSnapshot(): Promise<DashboardTable[]> {
  const restaurantId = await requireRestaurantId();

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

export async function createTable(formData: FormData): Promise<DashboardTable[]> {
  const number = parseIntField(formData.get("number"));

  if (!number || number <= 0) {
    throw new Error("Некоректний номер столика.");
  }

  const restaurantId = await requireRestaurantId();

  const duplicate = await prisma.table.findFirst({
    where: {
      restaurantId,
      number,
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new Error("Столик з таким номером вже існує.");
  }

  await prisma.table.create({
    data: {
      restaurantId,
      number,
      qrSlug: `table-${restaurantId}-${number}-${Date.now()}`,
    },
  });

  revalidateAdminPaths();
  return getTablesSnapshot();
}

export async function deleteTable(formData: FormData): Promise<DashboardTable[]> {
  const restaurantId = await requireRestaurantId();
  const tableId = parseIntField(formData.get("tableId"));
  const forceDelete = formData.get("forceDelete") === "true";

  if (!tableId) {
    throw new Error("Некоректний столик.");
  }

  const table = await prisma.table.findFirst({
    where: {
      id: tableId,
      restaurantId,
    },
    select: { id: true },
  });

  if (!table) {
    throw new Error("Столик не знайдено для обраного закладу.");
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
    throw new Error("Столик зайнятий. Підтвердіть видалення.");
  }

  await prisma.table.delete({
    where: { id: tableId },
  });

  revalidateAdminPaths();
  return getTablesSnapshot();
}

export type ManagerPeriod = "today" | "yesterday" | "week" | "month" | "previousMonth";

export type ManagerStatsResponse = {
  ordersCount: number;
  revenue: number;
  averageCheck: number;
  from: string;
  to: string;
  byDays: { label: string; ordersCount: number; revenue: number; averageCheck: number }[];
  byWeeks: { label: string; ordersCount: number; revenue: number; averageCheck: number }[];
};

const getRangeByPeriod = (period: ManagerPeriod) => {
  switch (period) {
    case "today":
      return getDayRange();
    case "yesterday":
      return getYesterdayRange();
    case "week":
      return getWeekRange();
    case "previousMonth":
      return getPreviousMonthRange();
    default:
      return getMonthRange();
  }
};

const getDayLabel = (completedAt: Date) => completedAt.toLocaleDateString("uk-UA");

export async function getManagerStats(period: ManagerPeriod): Promise<ManagerStatsResponse> {
  const restaurantId = await requireRestaurantId();
  const { start, end } = getRangeByPeriod(period);

  const paidOrders = await prisma.order.findMany({
    where: {
      status: "PAID",
      table: {
        restaurantId,
      },
      completedAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      completedAt: true,
      totalPrice: true,
    },
    orderBy: {
      completedAt: "asc",
    },
  });

  const ordersCount = paidOrders.length;
  const revenue = paidOrders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
  const averageCheck = ordersCount > 0 ? revenue / ordersCount : 0;
  const byDaysMap = new Map<string, { ordersCount: number; revenue: number }>();
  const byWeeksMap = new Map<string, { ordersCount: number; revenue: number }>();

  paidOrders.forEach((order) => {
    if (!order.completedAt) {
      return;
    }

    const orderTotal = Number(order.totalPrice);
    const dayLabel = getDayLabel(order.completedAt);
    const weekLabel = getWeekLabel(order.completedAt);

    updateStatsBucket(byDaysMap, dayLabel, orderTotal);
    updateStatsBucket(byWeeksMap, weekLabel, orderTotal);
  });

  return {
    ordersCount,
    revenue,
    averageCheck,
    from: start.toISOString(),
    to: end.toISOString(),
    byDays: toStatsRows(byDaysMap),
    byWeeks: toStatsRows(byWeeksMap),
  };
}
