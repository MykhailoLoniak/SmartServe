import { getActiveOrders } from "@/app/actions/getActiveOrders";
import WaiterReadyBoard from "@/components/WaiterReadyBoard";
import { KITCHEN_REFRESH_INTERVAL_MS } from "@/lib/kitchen-config";

export default async function WaiterPage() {
  const initialOrders = await getActiveOrders({ statuses: ["READY"] });

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <WaiterReadyBoard initialOrders={initialOrders} refreshIntervalMs={KITCHEN_REFRESH_INTERVAL_MS} />
    </div>
  );
}
