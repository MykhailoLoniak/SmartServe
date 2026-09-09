import type { SalesRow } from "../_lib/ownerDashboardMappers";
import { formatCurrency } from "../_lib/ownerDashboardFormatters";

type OwnerTopItemsTableProps = {
  salesRows: SalesRow[];
};

export function OwnerTopItemsTable({ salesRows }: OwnerTopItemsTableProps) {
  if (salesRows.length === 0) {
    return <p className="mt-4 text-black/60">There are no sales yet today.</p>;
  }

  return (
    <ul className="mt-4 space-y-3">
      {salesRows.map((row) => (
        <li key={row.id} className="flex items-center justify-between rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
          <p className="font-medium text-black">{row.name}</p>
          <p className="text-sm text-black/70">
            {row.quantity} pcs. · {formatCurrency(row.revenue)}
          </p>
        </li>
      ))}
    </ul>
  );
}
