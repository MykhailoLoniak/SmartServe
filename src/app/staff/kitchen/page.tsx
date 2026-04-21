import { requireRestaurantPermission } from "@/lib/restaurantContext";
import KitchenRealtimeBoard from "@/components/KitchenRealtimeBoard";
import { getActiveOrders } from "@/app/actions/getActiveOrders";
import { KITCHEN_ACTIVE_STATUSES, KITCHEN_REFRESH_INTERVAL_MS } from "@/lib/kitchen-config";

type KitchenPageProps = {
  restaurantId?: number;
};

export default async function KitchenPage({ restaurantId: scopedRestaurantId }: KitchenPageProps = {}) {
  const restaurantId = scopedRestaurantId ?? (await requireRestaurantPermission("update_kitchen_status"));
  const initialOrders = await getActiveOrders({ statuses: KITCHEN_ACTIVE_STATUSES, restaurantId });

  return (
    <KitchenRealtimeBoard
      restaurantId={restaurantId}
      initialOrders={initialOrders}
      refreshIntervalMs={KITCHEN_REFRESH_INTERVAL_MS}
      activeStatuses={KITCHEN_ACTIVE_STATUSES}
    />
  );
}
