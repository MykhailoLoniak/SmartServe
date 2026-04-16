import { getWaiterTableReports } from "@/app/actions/waiterReportActions";
import WaiterReadyBoard from "@/components/WaiterReadyBoard";
import { KITCHEN_REFRESH_INTERVAL_MS } from "@/lib/kitchen-config";

export default async function WaiterPage() {
  const initialTables = await getWaiterTableReports();

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <WaiterReadyBoard initialTables={initialTables} refreshIntervalMs={KITCHEN_REFRESH_INTERVAL_MS} />
    </div>
  );
}
