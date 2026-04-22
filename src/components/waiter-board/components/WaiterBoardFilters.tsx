import type { WaiterTab } from "../helpers/waiterBoardFilters";

type WaiterBoardFiltersProps = {
  activeTab: WaiterTab;
  setActiveTab: (tab: WaiterTab) => void;
};

export function WaiterBoardFilters({ activeTab, setActiveTab }: WaiterBoardFiltersProps) {
  return (
    <div className="mb-5 flex gap-2">
      <button
        type="button"
        onClick={() => setActiveTab("tables")}
        className={`rounded-xl px-4 py-2 text-sm font-medium ${
          activeTab === "tables" ? "bg-black text-white" : "bg-black/5 text-black"
        }`}
      >
        По столиках
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("completed")}
        className={`rounded-xl px-4 py-2 text-sm font-medium ${
          activeTab === "completed" ? "bg-black text-white" : "bg-black/5 text-black"
        }`}
      >
        Закриті сьогодні
      </button>
    </div>
  );
}
