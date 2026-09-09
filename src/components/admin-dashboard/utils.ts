import type { ManagerPeriod } from "@/app/actions/adminDashboardActions";
import type { MenuFormState, TabKey } from "./types";

export const DASHBOARD_TABS: Array<{ key: TabKey; label: string }> = [
  { key: "orders", label: "Active orders" },
  { key: "menu", label: "Menu editor" },
  { key: "tables", label: "Table management" },
  { key: "stats", label: "Statistics" },
];

export const MANAGER_PERIODS: Array<{ key: ManagerPeriod; label: string }> = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week", label: "Current week" },
  { key: "month", label: "Current month" },
  { key: "previousMonth", label: "Previous month" },
];

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 2,
  }).format(amount);

export const formatTime = (iso: string | null) => {
  if (!iso) {
    return "—";
  }

  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const createEmptyMenuForm = (categoryId: number | undefined): MenuFormState => ({
  id: "",
  name: "",
  description: "",
  price: "",
  categoryId: String(categoryId ?? ""),
  estimatedTime: "15",
  requiresKitchen: true,
});
