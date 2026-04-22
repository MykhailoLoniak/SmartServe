"use client";

import { CART_MESSAGES } from "@/lib/ui-config";
import { useCartActions } from "@/lib/cart/cartSelectors";

import { CartDrawer } from "./cart-floating/CartDrawer";
import { CartDrawerToggle } from "./cart-floating/CartDrawerToggle";
import { CartEmptyIndicator } from "./cart-floating/CartEmptyIndicator";
import { useCartFloatingButton } from "./cart-floating/hooks/useCartFloatingButton";
import { useCartSummary } from "./cart-floating/hooks/useCartSummary";

export default function CartFloatingButton() {
  const { addItem, removeItem, clearCart, updateCourse } = useCartActions();
  const { isOpen, message, isPending, openDrawer, closeDrawer, handleCreateOrder } =
    useCartFloatingButton({ clearCart });
  const summary = useCartSummary(message);

  if (!summary.shouldRender) {
    return null;
  }

  return (
    <>
      {message && <CartEmptyIndicator message={message} />}

      {summary.hasItems && (
        <CartDrawerToggle
          totalQuantity={summary.totalQuantity}
          totalPrice={summary.totalPrice}
          onOpen={openDrawer}
        />
      )}

      <CartDrawer
        isOpen={isOpen && summary.hasItems}
        items={summary.items}
        totalPrice={summary.totalPrice}
        tableLabel={summary.tableLabel}
        isPending={isPending}
        submitLabel={isPending ? CART_MESSAGES.submitPending : CART_MESSAGES.submitReady}
        onClose={closeDrawer}
        onRemove={removeItem}
        onAdd={addItem}
        onCourseChange={updateCourse}
        onClear={clearCart}
        onSubmit={handleCreateOrder}
      />
    </>
  );
}
