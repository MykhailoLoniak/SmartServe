import { getRefreshSeconds } from "../helpers/kitchenBoardFormatters";

type KitchenBoardHeaderProps = {
  ordersCount: number;
  refreshIntervalMs: number;
};

export function KitchenBoardHeader({ ordersCount, refreshIntervalMs }: KitchenBoardHeaderProps) {
  return (
    <header className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Кухня · Замовлення</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Оновлення списку відбувається кожні {getRefreshSeconds(refreshIntervalMs)} секунд.
        </p>
      </div>
      <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700">{ordersCount}</span>
    </header>
  );
}
