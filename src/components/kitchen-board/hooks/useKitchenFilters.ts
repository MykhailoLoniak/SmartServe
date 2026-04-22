import { useMemo, useState } from "react";

import type { ActiveKitchenOrder } from "@/app/actions/getActiveOrders";

import { getOrdersByTab, type OrdersTab } from "../helpers/kitchenBoardFilters";

export const useKitchenFilters = ({
  activeOrders,
  completedOrders,
}: {
  activeOrders: ActiveKitchenOrder[];
  completedOrders: ActiveKitchenOrder[];
}) => {
  const [activeTab, setActiveTab] = useState<OrdersTab>("active");

  const orders = useMemo(
    () => getOrdersByTab({ activeOrders, completedOrders, activeTab }),
    [activeOrders, activeTab, completedOrders],
  );

  const ordersCount = useMemo(() => orders.length, [orders]);

  return {
    activeTab,
    setActiveTab,
    orders,
    ordersCount,
  };
};
