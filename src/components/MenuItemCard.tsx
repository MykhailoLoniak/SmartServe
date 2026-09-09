"use client";

import { CART_MESSAGES, CURRENCY_SYMBOL } from "@/lib/ui-config";
import { useCartStore } from "@/store/useCartStore";

type MenuItemCardProps = {
  item: {
    id: number;
    name: string;
    description: string | null;
    price: number;
  };
};

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <article className="rounded-2xl border border-black/10 p-5 shadow-sm bg-white/80">
      <h2 className="text-xl font-semibold text-black">{item.name}</h2>
      <p className="mt-2 text-sm text-black/70">{item.description ?? "A description will be added soon."}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-lg font-bold text-black">
          {item.price.toFixed(2)} {CURRENCY_SYMBOL}
        </span>
        <button
          type="button"
          onClick={() => addItem({ id: String(item.id), name: item.name, price: item.price })}
          className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/85"
        >
          <span aria-hidden>＋</span>
          {CART_MESSAGES.addToCart}
        </button>
      </div>
    </article>
  );
}
