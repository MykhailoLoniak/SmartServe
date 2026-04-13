"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";

export default function CartFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, totalPrice, removeItem, clearCart } = useCartStore((state) => ({
    items: state.items,
    totalPrice: state.totalPrice,
    removeItem: state.removeItem,
    clearCart: state.clearCart,
  }));

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQuantity === 0) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 right-4 z-40 rounded-2xl bg-black px-5 py-4 text-left text-white shadow-lg md:left-auto md:right-8 md:w-[360px]"
      >
        <p className="text-sm text-white/80">Кількість страв: {totalQuantity}</p>
        <p className="text-lg font-semibold">Загальна сума: {totalPrice.toFixed(2)} ₴</p>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-6 text-black md:left-auto md:right-8 md:bottom-20 md:w-[420px]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Ваше замовлення</h3>
              <button type="button" onClick={() => setIsOpen(false)} className="text-sm text-black/60">
                Закрити
              </button>
            </div>

            <ul className="max-h-[280px] space-y-3 overflow-y-auto pr-2">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-xl border border-black/10 p-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-black/60">
                      {item.quantity} × {item.price.toFixed(2)} ₴
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="rounded-lg border border-black/20 px-2 py-1 text-xs"
                  >
                    -1
                  </button>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-base font-semibold">Разом: {totalPrice.toFixed(2)} ₴</p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={clearCart}
                className="flex-1 rounded-xl border border-black/20 px-4 py-2 text-sm"
              >
                Очистити
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
              >
                Замовити
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
