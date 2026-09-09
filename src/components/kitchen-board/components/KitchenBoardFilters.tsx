import type { OrdersTab } from "../helpers/kitchenBoardFilters";

type KitchenBoardFiltersProps = {
  activeTab: OrdersTab;
  setActiveTab: (tab: OrdersTab) => void;
};

export function KitchenBoardFilters({ activeTab, setActiveTab }: KitchenBoardFiltersProps) {
  return (
    <div className="mb-5 flex gap-2">
      <button
        type="button"
        onClick={() => setActiveTab("active")}
        className={`rounded-xl px-4 py-2 text-sm font-medium ${
          activeTab === "active" ? "bg-black text-white" : "bg-neutral-100 text-neutral-700"
        }`}
      >
        Active
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("completed")}
        className={`rounded-xl px-4 py-2 text-sm font-medium ${
          activeTab === "completed" ? "bg-black text-white" : "bg-neutral-100 text-neutral-700"
        }`}
      >
        Completed
      </button>
    </div>
  );
}
