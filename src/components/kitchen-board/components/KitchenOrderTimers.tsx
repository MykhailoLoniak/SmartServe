import CookingTimer from "@/components/CookingTimer";

type KitchenOrderTimersProps = {
  startedAt: string | null;
  status: "PENDING" | "COOKING" | "READY";
};

export function KitchenOrderTimers({ startedAt, status }: KitchenOrderTimersProps) {
  return <CookingTimer status={status} startedAt={startedAt} />;
}
