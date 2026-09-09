"use client";

import { useEffect, useMemo, useState } from "react";

type CookingTimerProps = {
  status: "PENDING" | "COOKING" | "READY";
  startedAt: string | null;
};

const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
};

export default function CookingTimer({ status, startedAt }: CookingTimerProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (status !== "COOKING" || !startedAt) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [startedAt, status]);

  const ui = useMemo(() => {
    if (status === "PENDING") {
      return {
        label: "Queued",
        className: "text-neutral-500",
      };
    }

    if (status !== "COOKING" || !startedAt) {
      return {
        label: status === "READY" ? "Ready" : "Queued",
        className: "text-emerald-600",
      };
    }

    const elapsedMs = now - new Date(startedAt).getTime();
    const elapsedMinutes = elapsedMs / 60000;

    if (elapsedMinutes >= 15) {
      return {
        label: formatDuration(elapsedMs),
        className: "animate-pulse text-red-600",
      };
    }

    if (elapsedMinutes >= 10) {
      return {
        label: formatDuration(elapsedMs),
        className: "text-amber-600",
      };
    }

    return {
      label: formatDuration(elapsedMs),
      className: "text-blue-700",
    };
  }, [now, startedAt, status]);

  return (
    <span suppressHydrationWarning className={`text-xs font-semibold ${ui.className}`}>
      {ui.label}
    </span>
  );
}
