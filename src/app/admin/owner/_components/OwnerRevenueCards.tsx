import { formatCurrency } from "../_lib/ownerDashboardFormatters";

type OwnerRevenueCardsProps = {
  paidOrdersCount: number;
  paidRevenueTotal: number;
};

export function OwnerRevenueCards({ paidOrdersCount, paidRevenueTotal }: OwnerRevenueCardsProps) {
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <article className="rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
        <p className="text-sm text-black/60">Paid orders</p>
        <p className="mt-2 text-2xl font-bold text-black">{paidOrdersCount}</p>
      </article>
      <article className="rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
        <p className="text-sm text-black/60">Revenue</p>
        <p className="mt-2 text-2xl font-bold text-black">{formatCurrency(paidRevenueTotal)}</p>
      </article>
    </div>
  );
}
