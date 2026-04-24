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

export type DashboardCategory = {
  id: number;
  name: string;
};

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

export type DashboardTable = {
  id: number;
  number: number;
  activeOrdersCount: number;
};

export type ManagerPeriod = "today" | "yesterday" | "week" | "month" | "previousMonth";

export type ManagerStatsRow = {
  label: string;
  ordersCount: number;
  revenue: number;
  averageCheck: number;
};

export type ManagerStatsResponse = {
  ordersCount: number;
  revenue: number;
  averageCheck: number;
  from: string;
  to: string;
  byDays: ManagerStatsRow[];
  byWeeks: ManagerStatsRow[];
};
