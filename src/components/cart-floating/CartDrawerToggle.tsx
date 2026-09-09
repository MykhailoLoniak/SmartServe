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
    <button type="button" onClick={onOpen} aria-haspopup="dialog" aria-label="Open cart" className={`${FLOATING_LAYOUT_CLASSES} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}>
      <CartButtonBadge quantity={totalQuantity} />
      <CartSummaryText totalPrice={totalPrice} />
    </button>
  );
}
