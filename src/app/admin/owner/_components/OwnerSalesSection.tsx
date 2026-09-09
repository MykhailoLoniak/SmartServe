import type { SalesRow } from "../_lib/ownerDashboardMappers";
import { OwnerRevenueCards } from "./OwnerRevenueCards";
import { OwnerTopItemsTable } from "./OwnerTopItemsTable";

type OwnerSalesSectionProps = {
  paidOrdersCount: number;
  paidRevenueTotal: number;
  salesRows: SalesRow[];
};

export function OwnerSalesSection({ paidOrdersCount, paidRevenueTotal, salesRows }: OwnerSalesSectionProps) {
  return (
    <section className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-black">Sales report (today)</h2>
      <OwnerRevenueCards paidOrdersCount={paidOrdersCount} paidRevenueTotal={paidRevenueTotal} />
      <OwnerTopItemsTable salesRows={salesRows} />
    </section>
  );
}
