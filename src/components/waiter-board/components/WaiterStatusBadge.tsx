import { getWaiterStatusLabel } from "../helpers/waiterBoardMappers";

type WaiterStatusBadgeProps = {
  status: "PENDING" | "COOKING" | "READY" | "SERVED";
};

export function WaiterStatusBadge({ status }: WaiterStatusBadgeProps) {
  const isReady = status === "READY" || status === "SERVED";

  return (
    <p className={`mt-1 text-xs ${isReady ? "text-emerald-700" : "text-black/60"}`}>
      {getWaiterStatusLabel(status)}
    </p>
  );
}
