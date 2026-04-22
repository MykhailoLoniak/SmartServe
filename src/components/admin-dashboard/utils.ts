import type { ManagerPeriod } from "@/app/actions/adminDashboardActions";
import type { MenuFormState, TabKey } from "./types";

export const DASHBOARD_TABS: Array<{ key: TabKey; label: string }> = [
  { key: "orders", label: "Активні замовлення" },
  { key: "menu", label: "Редактор меню" },
  { key: "tables", label: "Керування столиками" },
  { key: "stats", label: "Статистика" },
];

export const MANAGER_PERIODS: Array<{ key: ManagerPeriod; label: string }> = [
  { key: "today", label: "Сьогодні" },
  { key: "yesterday", label: "Вчора" },
  { key: "week", label: "Поточний тиждень" },
  { key: "month", label: "Поточний місяць" },
  { key: "previousMonth", label: "Місяць тому" },
];

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 2,
  }).format(amount);

export const formatTime = (iso: string | null) => {
  if (!iso) {
    return "—";
  }

  return new Date(iso).toLocaleTimeString("uk-UA", {
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
});
