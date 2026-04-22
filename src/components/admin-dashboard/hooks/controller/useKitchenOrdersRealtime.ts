import { useEffect, useMemo, useState } from "react";

import { getCookingItems, getTablesSnapshot, type DashboardCookingItem, type DashboardTable } from "@/app/actions/adminDashboardActions";
import { getActiveOrders, type ActiveKitchenOrder } from "@/app/actions/getActiveOrders";
import { subscribeToKitchenOrderChanges } from "@/lib/supabase-browser";

type KitchenRealtimeParams = {
  restaurantId?: number;
  initialCookingItems: DashboardCookingItem[];
  initialActiveOrders: ActiveKitchenOrder[];
  initialCompletedOrders: ActiveKitchenOrder[];
  initialTables: DashboardTable[];
};

export const useKitchenOrdersRealtime = ({
  restaurantId,
  initialCookingItems,
  initialActiveOrders,
  initialCompletedOrders,
  initialTables,
}: KitchenRealtimeParams) => {
  const [cookingItems, setCookingItems] = useState(initialCookingItems);
  const [activeOrders, setActiveOrders] = useState(initialActiveOrders);
  const [completedOrders, setCompletedOrders] = useState(initialCompletedOrders);
  const [tables, setTables] = useState(initialTables);
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    setCookingItems(initialCookingItems);
    setActiveOrders(initialActiveOrders);
    setCompletedOrders(initialCompletedOrders);
  }, [initialActiveOrders, initialCompletedOrders, initialCookingItems]);

  useEffect(() => setTables(initialTables), [initialTables]);

  useEffect(() => {
    const tickId = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(tickId);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const refreshKitchenData = async () => {
      try {
        const [items, nextActiveOrders, nextCompletedOrders, nextTables] = await Promise.all([
          getCookingItems(restaurantId),
          getActiveOrders({ statuses: ["PENDING", "COOKING"], mode: "active", restaurantId }),
          getActiveOrders({ statuses: ["PAID"], mode: "completed", restaurantId }),
          getTablesSnapshot(restaurantId),
        ]);

        if (!isMounted) {
          return;
        }

        setCookingItems(items);
        setActiveOrders(nextActiveOrders);
        setCompletedOrders(nextCompletedOrders);
        setTables(nextTables);
      } catch (error) {
        console.error("Failed to refresh kitchen items", error);
      }
    };

    const subscription = subscribeToKitchenOrderChanges({
      onChange: () => {
        void refreshKitchenData();
      },
    });

    const intervalId = window.setInterval(() => {
      void refreshKitchenData();
    }, 20_000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      subscription?.unsubscribe();
    };
  }, [restaurantId]);

  const rowsWithDelay = useMemo(
    () =>
      cookingItems.map((item) => {
        const elapsedMinutes = item.startedAt ? Math.max(0, Math.floor((nowMs - new Date(item.startedAt).getTime()) / 60000)) : 0;
        return {
          ...item,
          elapsedMinutes,
          critical: elapsedMinutes >= item.estimatedTime + 5,
        };
      }),
    [cookingItems, nowMs],
  );

  return {
    activeOrders,
    completedOrders,
    tables,
    rowsWithDelay,
    setTables,
  };
};
