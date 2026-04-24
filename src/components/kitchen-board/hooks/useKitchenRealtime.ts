import { type OrderStatus } from "@prisma/client";
import { useEffect, useState } from "react";

import { getActiveOrders, type ActiveKitchenOrder } from "@/app/actions/getActiveOrders";
import { KITCHEN_COMPLETED_STATUSES } from "@/lib/kitchen-config";
import { subscribeToKitchenOrderChanges } from "@/lib/supabase-browser";

import { getMidnightRefreshDelayMs } from "../helpers/kitchenBoardTimers";

type UseKitchenRealtimeParams = {
  activeStatuses: OrderStatus[];
  initialOrders: ActiveKitchenOrder[];
  refreshIntervalMs: number;
  restaurantId?: number;
};

export const useKitchenRealtime = ({
  activeStatuses,
  initialOrders,
  refreshIntervalMs,
  restaurantId,
}: UseKitchenRealtimeParams) => {
  const [activeOrders, setActiveOrders] = useState<ActiveKitchenOrder[]>(initialOrders);
  const [completedOrders, setCompletedOrders] = useState<ActiveKitchenOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setActiveOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    let isMounted = true;

    const refreshOrders = async () => {
      try {
        const [activeData, completedData] = await Promise.all([
          getActiveOrders({ statuses: activeStatuses, mode: "active", restaurantId }),
          getActiveOrders({ statuses: KITCHEN_COMPLETED_STATUSES, mode: "completed", restaurantId }),
        ]);

        if (isMounted) {
          setActiveOrders(activeData);
          setCompletedOrders(completedData);
        }
      } catch (error) {
        console.error("Failed to refresh kitchen orders", error);
      }
    };

    setIsLoading(true);

    const subscription = subscribeToKitchenOrderChanges({
      onChange: () => {
        void refreshOrders();
      },
    });

    const intervalId = window.setInterval(() => {
      void refreshOrders();
    }, refreshIntervalMs);

    const midnightTimeout = window.setTimeout(() => {
      void refreshOrders();
    }, getMidnightRefreshDelayMs(new Date()));

    void refreshOrders().finally(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.clearTimeout(midnightTimeout);
      subscription?.unsubscribe();
    };
  }, [activeStatuses, refreshIntervalMs, restaurantId]);

  return {
    activeOrders,
    completedOrders,
    isLoading,
  };
};
