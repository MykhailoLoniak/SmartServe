import { requireRestaurantPermission } from "@/lib/restaurantContext";
import { getWaiterTableReports } from "@/app/actions/waiterReportActions";
import WaiterReadyBoard from "@/components/WaiterReadyBoard";
import { KITCHEN_REFRESH_INTERVAL_MS } from "@/lib/kitchen-config";

type WaiterPageProps = {
  restaurantId?: number;
};

export default async function WaiterPage({ restaurantId: scopedRestaurantId }: WaiterPageProps = {}) {
  const restaurantId = scopedRestaurantId ?? (await requireRestaurantPermission("close_bill"));
  const initialTables = await getWaiterTableReports(restaurantId);

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <WaiterReadyBoard restaurantId={restaurantId} initialTables={initialTables} refreshIntervalMs={KITCHEN_REFRESH_INTERVAL_MS} />
    </div>
  );
}
