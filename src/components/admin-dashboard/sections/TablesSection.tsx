import type { DashboardTable } from "@/app/actions/adminDashboardActions";
import Link from "next/link";

type TablesSectionProps = {
  tables: DashboardTable[];
  newTableNumber: string;
  onTableNumberChange: (value: string) => void;
  onCreateTable: () => void;
  onDeleteTable: (tableId: number, activeOrdersCount: number) => void;
};

export const TablesSection = ({ tables, newTableNumber, onTableNumberChange, onCreateTable, onDeleteTable }: TablesSectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-black">Table management</h2>

      <div className="flex w-full justify-between text-center">
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
          <label className="text-sm text-black/70">
            New table number
            <input
              type="number"
              min={1}
              value={newTableNumber}
              onChange={(event) => onTableNumberChange(event.target.value)}
              className="mt-1 w-full rounded-lg border border-black/20 bg-white px-3 py-2"
            />
          </label>
          <button type="button" onClick={onCreateTable} className="rounded-lg bg-black px-4 py-2 text-sm text-white">
            Add
          </button>
        </div>

        <Link className="max-h-fit rounded-lg bg-black/5 px-4 py-2 text-2xl font-medium text-black transition hover:bg-black/10" href="qr">
          QR code generator
        </Link>
      </div>

      <ul className="space-y-3">
        {tables.map((table) => (
          <li key={table.id} className="flex items-center justify-between rounded-xl border border-black/10 bg-[#f7f7f8] p-4">
            <div>
              <p className="font-medium">Table #{table.number}</p>
              <p className="text-sm text-black/60">Active orders: {table.activeOrdersCount}</p>
            </div>
            <button
              type="button"
              onClick={() => onDeleteTable(table.id, table.activeOrdersCount)}
              className="rounded-lg bg-red-100 px-3 py-1.5 text-sm text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
        {tables.length === 0 ? <li className="text-black/60">No tables yet.</li> : null}
      </ul>
    </div>
  );
};
