export type WaiterTab = "tables" | "completed";

export const isTablesTab = (activeTab: WaiterTab) => activeTab === "tables";
