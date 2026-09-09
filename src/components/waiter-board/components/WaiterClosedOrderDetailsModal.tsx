import type { ClosedOrderDetails } from "@/app/actions/waiterReportActions";

import { formatCurrency } from "../helpers/waiterBoardFormatters";

type WaiterClosedOrderDetailsModalProps = {
  details: ClosedOrderDetails | null;
  errorMessage: string | null;
  isLoading: boolean;
  onClose: () => void;
};

const formatDateTime = (value: string | null) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
};

export function WaiterClosedOrderDetailsModal({ details, errorMessage, isLoading, onClose }: WaiterClosedOrderDetailsModalProps) {
  if (!isLoading && !details && !errorMessage) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-4" onClick={onClose}>
      <div className="mx-auto mt-8 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4 md:p-6" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-black">Closed order details</h3>
          <button type="button" onClick={onClose} className="rounded-lg bg-black/10 px-3 py-1 text-sm">
            Close
          </button>
        </div>

        {isLoading ? <p className="rounded-lg bg-black/5 p-3 text-sm text-black/70">Loading details…</p> : null}
        {errorMessage ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p> : null}

        {details ? (
          <div className="space-y-4 text-sm text-black/80">
            <div className="grid grid-cols-1 gap-2 rounded-xl border border-black/10 p-3 md:grid-cols-2">
              <p>Order: #{details.id}</p>
              <p>Table: №{details.tableNumber}</p>
              <p>Status: {details.status}</p>
              <p>Payment: {details.paymentStatus === "PAID" ? "Paid" : "Unpaid"}</p>
              <p>Created: {formatDateTime(details.createdAt)}</p>
              <p>Closed: {formatDateTime(details.closedAt)}</p>
            </div>

            <ul className="space-y-2">
              {details.items.map((item) => (
                <li key={item.id} className="rounded-xl border border-black/10 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-black">{item.name}</p>
                    <p className="text-xs text-black/60">{item.status}</p>
                  </div>
                  <p className="mt-1 text-black/70">
                    {item.quantity} × {formatCurrency(item.priceAtTime)} = <span className="font-semibold text-black">{formatCurrency(item.total)}</span>
                  </p>
                </li>
              ))}
            </ul>

            <div className="rounded-xl bg-black p-3 text-right text-base font-semibold text-white">Total: {formatCurrency(details.total)}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
