import type {
  DashboardCategory,
  DashboardCookingItem,
  DashboardMenuItem,
  DashboardTable,
  ManagerPeriod,
  ManagerStatsResponse,
} from "@/app/actions/adminDashboardActions";
import type { ActiveKitchenOrder } from "@/app/actions/getActiveOrders";

export type TabKey = "orders" | "menu" | "tables" | "stats";
export type OrderViewTab = "active" | "completed";

export type MenuFormState = {
  id: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  estimatedTime: string;
  requiresKitchen: boolean;
};

export type AdminDashboardRealtimeProps = {
  restaurantId?: number;
  initialCookingItems: DashboardCookingItem[];
  initialMenuItems: DashboardMenuItem[];
  categories: DashboardCategory[];
  initialActiveOrders: ActiveKitchenOrder[];
  initialCompletedOrders: ActiveKitchenOrder[];
  initialTables: DashboardTable[];
  initialManagerStats: ManagerStatsResponse;
};

export type AdminDashboardState = {
  activeTab: TabKey;
  orderViewTab: OrderViewTab;
  cookingItems: DashboardCookingItem[];
  activeOrders: ActiveKitchenOrder[];
  completedOrders: ActiveKitchenOrder[];
  menuItems: DashboardMenuItem[];
  tables: DashboardTable[];
  newTableNumber: string;
  managerPeriod: ManagerPeriod;
  managerStats: ManagerStatsResponse;
  categories: DashboardCategory[];
  quickCategoryName: string;
  categoryFilter: string;
  availabilityFilter: "all" | "available" | "blocked";
  formState: MenuFormState;
};
