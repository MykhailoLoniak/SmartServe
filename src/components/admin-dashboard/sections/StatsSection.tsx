import type { ManagerPeriod, ManagerStatsResponse } from "@/app/actions/adminDashboardActions";

import { MANAGER_PERIODS, formatCurrency } from "../utils";

type StatsSectionProps = {
  managerPeriod: ManagerPeriod;
  managerStats: ManagerStatsResponse;
  onPeriodChange: (period: ManagerPeriod) => void;
};

export const StatsSection = ({ managerPeriod, managerStats, onPeriodChange }: StatsSectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-black">Статистика за періоди</h2>

      <div className="flex flex-wrap gap-2">
        {MANAGER_PERIODS.map((period) => (
          <button
            key={period.key}
            type="button"
            onClick={() => onPeriodChange(period.key)}
            className={`rounded-lg px-3 py-2 text-sm ${managerPeriod === period.key ? "bg-black text-white" : "bg-black/5 text-black"}`}
          >
            {period.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
          <p className="text-sm text-black/60">Кількість замовлень</p>
          <p className="mt-2 text-3xl font-bold">{managerStats.ordersCount}</p>
        </article>
        <article className="rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
          <p className="text-sm text-black/60">Виручка</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(managerStats.revenue)}</p>
        </article>
        <article className="rounded-xl border border-black/10 bg-[#f7f7f8] p-4 md:col-span-2">
          <p className="text-sm text-black/60">Середній чек</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(managerStats.averageCheck)}</p>
        </article>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
          <h3 className="mb-2 font-semibold">По днях</h3>
          <ul className="space-y-2 text-sm">
            {managerStats.byDays.map((row) => (
              <li key={row.label} className="flex items-center justify-between">
                <span>{row.label}</span>
                <span>{row.ordersCount} · {formatCurrency(row.revenue)}</span>
              </li>
            ))}
            {managerStats.byDays.length === 0 ? <li className="text-black/60">Немає даних.</li> : null}
          </ul>
        </article>

        <article className="rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
          <h3 className="mb-2 font-semibold">По тижнях</h3>
          <ul className="space-y-2 text-sm">
            {managerStats.byWeeks.map((row) => (
              <li key={row.label} className="flex items-center justify-between">
                <span>{row.label}</span>
                <span>{row.ordersCount} · {formatCurrency(row.revenue)}</span>
              </li>
            ))}
            {managerStats.byWeeks.length === 0 ? <li className="text-black/60">Немає даних.</li> : null}
          </ul>
        </article>
      </div>
    </div>
  );
};
