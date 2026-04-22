import type { ActiveKitchenOrder } from "@/app/actions/getActiveOrders";

export type OrdersTab = "active" | "completed";

export const getOrdersByTab = ({
  activeOrders,
  completedOrders,
  activeTab,
}: {
  activeOrders: ActiveKitchenOrder[];
  completedOrders: ActiveKitchenOrder[];
  activeTab: OrdersTab;
}) => (activeTab === "active" ? activeOrders : completedOrders);
