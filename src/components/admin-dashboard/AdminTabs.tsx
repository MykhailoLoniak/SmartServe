import type { TabKey } from "./types";
import { DASHBOARD_TABS } from "./utils";

type AdminTabsProps = {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
};

export const AdminTabs = ({ activeTab, onChange }: AdminTabsProps) => {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {DASHBOARD_TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeTab === tab.key ? "bg-black text-white" : "bg-black/5 text-black hover:bg-black/10"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
