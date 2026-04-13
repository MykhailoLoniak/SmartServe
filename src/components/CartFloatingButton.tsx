"use client";

import { useState, useTransition } from "react";
import { shallow } from "zustand/shallow";
import { createOrder } from "@/app/actions/createOrder";
import { useCartStore } from "@/store/useCartStore";

export default function CartFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const tableId = useCartStore((state) => state.tableId);
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCreateOrder = () => {
    if (!tableId) {
      setMessage("Не вдалося визначити столик. Відкрийте меню з QR-коду ще раз.");
      return;
    }

    setMessage(null);

    startTransition(async () => {
      try {
        await createOrder({
          tableId,
          items: items.map((item) => ({
            id: Number(item.id),
            quantity: item.quantity,
            priceAtTime: item.price,
          })),
        });

        clearCart();
        setMessage("Замовлення прийнято!");
        setIsOpen(false);
      } catch {
        setMessage("Не вдалося створити замовлення. Спробуйте ще раз.");
      }
    });
  };

  if (totalQuantity === 0 && !message) {
    return null;
  }

  return (
    <>
      {message && (
        <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl bg-black px-4 py-3 text-sm text-white shadow-lg md:left-auto md:right-8 md:w-[360px]">
          {message}
        </div>
      )}

      {totalQuantity > 0 && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 left-4 right-4 z-40 rounded-2xl bg-black px-5 py-4 text-left text-white shadow-lg md:left-auto md:right-8 md:w-[360px]"
        >
          <p className="text-sm text-white/80">Кількість страв: {totalQuantity}</p>
          <p className="text-lg font-semibold">Загальна сума: {totalPrice.toFixed(2)} ₴</p>
        </button>
      )}

      {isOpen && totalQuantity > 0 && (
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
                    disabled={isPending}
                  >
                    -1
                  </button>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-base font-semibold">Разом: {totalPrice.toFixed(2)} ₴</p>
            <p className="mt-1 text-xs text-black/60">Стіл: {tableId ?? "невідомо"}</p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={clearCart}
                className="flex-1 rounded-xl border border-black/20 px-4 py-2 text-sm"
                disabled={isPending}
              >
                Очистити
              </button>
              <button
                type="button"
                onClick={handleCreateOrder}
                className="flex-1 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending}
              >
                {isPending ? "Відправка..." : "Замовити"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
