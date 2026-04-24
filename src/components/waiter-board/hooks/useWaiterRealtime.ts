import { useCallback, useEffect, useState } from "react";

import { getActiveOrders, type ActiveKitchenOrder } from "@/app/actions/getActiveOrders";
import { getWaiterTableReports, type WaiterTableReport } from "@/app/actions/waiterReportActions";
import { subscribeToKitchenOrderChanges } from "@/lib/supabase-browser";

type UseWaiterRealtimeParams = {
  initialTables: WaiterTableReport[];
  refreshIntervalMs: number;
  restaurantId?: number;
};

export const useWaiterRealtime = ({ initialTables, refreshIntervalMs, restaurantId }: UseWaiterRealtimeParams) => {
  const [tableReports, setTableReports] = useState<WaiterTableReport[]>(initialTables);
  const [completedOrders, setCompletedOrders] = useState<ActiveKitchenOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshOrders = useCallback(async () => {
    const [tablesData, completedData] = await Promise.all([
      getWaiterTableReports(restaurantId),
      getActiveOrders({ statuses: ["PAID"], mode: "completed", restaurantId }),
    ]);

    setTableReports(tablesData);
    setCompletedOrders(completedData);
  }, [restaurantId]);

  useEffect(() => {
    setTableReports(initialTables);
  }, [initialTables]);

  useEffect(() => {
    let isMounted = true;

    const refresh = async () => {
      try {
        await refreshOrders();
      } catch (error) {
        console.error("Failed to refresh waiter board", error);
      }
    };

    setIsLoading(true);

    const subscription = subscribeToKitchenOrderChanges({
      onChange: () => {
        void refresh();
      },
    });

    const intervalId = window.setInterval(() => {
      void refresh();
    }, refreshIntervalMs);

    void refresh().finally(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      subscription?.unsubscribe();
    };
  }, [refreshIntervalMs, refreshOrders]);

  return {
    completedOrders,
    isLoading,
    refreshOrders,
    tableReports,
  };
};
