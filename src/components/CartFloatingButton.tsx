"use client";

import { useState, useTransition } from "react";

import { createOrder } from "@/app/actions/createOrder";
import { CART_MESSAGES, CURRENCY_SYMBOL } from "@/lib/ui-config";
import { useCartStore } from "@/store/useCartStore";

export default function CartFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const tableId = useCartStore((state) => state.tableId);
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCreateOrder = () => {
    if (!tableId) {
      setMessage(CART_MESSAGES.missingTableId);
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
        setMessage(CART_MESSAGES.orderAccepted);
        setIsOpen(false);
      } catch {
        setMessage(CART_MESSAGES.orderFailed);
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
          <p className="text-lg font-semibold">
            Загальна сума: {totalPrice.toFixed(2)} {CURRENCY_SYMBOL}
          </p>
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
                      {item.quantity} × {item.price.toFixed(2)} {CURRENCY_SYMBOL}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addItem({ id: item.id, name: item.name, price: item.price })}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/20 text-sm font-semibold transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isPending}
                      aria-label={`Додати ще одну порцію ${item.name}`}
                    >
                      +
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/20 text-black/70 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isPending}
                      aria-label={`Відняти одну порцію ${item.name}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-base font-semibold">
              Разом: {totalPrice.toFixed(2)} {CURRENCY_SYMBOL}
            </p>
            <p className="mt-1 text-xs text-black/60">Стіл: {tableId ?? CART_MESSAGES.unknownTable}</p>

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
                {isPending ? CART_MESSAGES.submitPending : CART_MESSAGES.submitReady}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
