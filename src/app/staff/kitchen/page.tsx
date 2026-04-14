import KitchenRealtimeBoard from "@/components/KitchenRealtimeBoard";
import { getActiveOrders } from "@/app/actions/getActiveOrders";
import { KITCHEN_ACTIVE_STATUSES, KITCHEN_REFRESH_INTERVAL_MS } from "@/lib/kitchen-config";

export default async function KitchenPage() {
  const initialOrders = await getActiveOrders({ statuses: KITCHEN_ACTIVE_STATUSES });

  return (
    <KitchenRealtimeBoard
      initialOrders={initialOrders}
      refreshIntervalMs={KITCHEN_REFRESH_INTERVAL_MS}
      activeStatuses={KITCHEN_ACTIVE_STATUSES}
    />
  );
}
