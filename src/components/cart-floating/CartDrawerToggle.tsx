import { CartButtonBadge } from "./CartButtonBadge";
import { CartSummaryText } from "./CartSummaryText";
import { FLOATING_LAYOUT_CLASSES } from "./constants";

type CartDrawerToggleProps = {
  totalQuantity: number;
  totalPrice: number;
  onOpen: () => void;
};

export function CartDrawerToggle({ totalQuantity, totalPrice, onOpen }: CartDrawerToggleProps) {
  return (
    <button type="button" onClick={onOpen} className={FLOATING_LAYOUT_CLASSES}>
      <CartButtonBadge quantity={totalQuantity} />
      <CartSummaryText totalPrice={totalPrice} />
    </button>
  );
}
