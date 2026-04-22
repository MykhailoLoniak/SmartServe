import { formatOrderTime } from "../helpers/waiterBoardFormatters";
import { formatElapsedMinutes, getElapsedMinutes } from "../helpers/waiterBoardTimers";

type WaiterOrderTimerProps = {
  createdAt: string;
  nowTimestamp?: number;
  prefix?: string;
};

export function WaiterOrderTimer({ createdAt, nowTimestamp, prefix = "" }: WaiterOrderTimerProps) {
  const elapsed = nowTimestamp ? ` · ${formatElapsedMinutes(getElapsedMinutes(createdAt, nowTimestamp))}` : "";

  return (
    <p className="text-xs text-black/60">
      {prefix}
      {formatOrderTime(createdAt)}
      {elapsed}
    </p>
  );
}
