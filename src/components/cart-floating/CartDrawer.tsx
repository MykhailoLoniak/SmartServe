"use client";

import { useEffect, useRef } from "react";

import { CART_MESSAGES } from "@/lib/ui-config";
import { type CartItem, type CartCourse } from "@/store/useCartStore";

import { CartItemRow } from "./CartItemRow";
import { CartPriceDisplay } from "./CartPriceDisplay";

type CartDrawerProps = {
  isOpen: boolean;
  items: CartItem[];
  totalPrice: number;
  tableLabel: number | string;
  isPending: boolean;
  submitLabel: string;
  onClose: () => void;
  onRemove: (id: string) => void;
  onAdd: (item: Pick<CartItem, "id" | "name" | "price">) => void;
  onCourseChange: (id: string, course: CartCourse) => void;
  onClear: () => void;
  onSubmit: () => void;
};

export function CartDrawer({
  isOpen,
  items,
  totalPrice,
  tableLabel,
  isPending,
  submitLabel,
  onClose,
  onRemove,
  onAdd,
  onCourseChange,
  onClear,
  onSubmit,
}: CartDrawerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>("button, select, [href], [tabindex]:not([tabindex='-1'])")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>("button:not(:disabled), select:not(:disabled), [href], [tabindex]:not([tabindex='-1'])")];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); previouslyFocused?.focus(); };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-dialog-title"
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-6 text-black md:bottom-20 md:left-auto md:right-8 md:w-[420px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id="cart-dialog-title" className="text-xl font-semibold">Your order</h3>
          <button type="button" onClick={onClose} className="rounded text-sm text-black/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
            Close
          </button>
        </div>

        <ul className="max-h-[280px] space-y-3 overflow-y-auto pr-2">
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              disabled={isPending}
              onRemove={onRemove}
              onAdd={onAdd}
              onCourseChange={onCourseChange}
            />
          ))}
        </ul>

        <CartPriceDisplay amount={totalPrice} className="mt-4 text-base font-semibold" prefix="Total" />
        <p className="mt-1 text-xs text-black/60">Table: {tableLabel ?? CART_MESSAGES.unknownTable}</p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClear}
            className="flex-1 rounded-xl border border-black/20 px-4 py-2 text-sm"
            disabled={isPending}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="flex-1 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
