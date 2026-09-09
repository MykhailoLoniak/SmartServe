import { CartPriceDisplay } from "./CartPriceDisplay";

type CartSummaryTextProps = {
  totalPrice: number;
};

export function CartSummaryText({ totalPrice }: CartSummaryTextProps) {
  return <CartPriceDisplay amount={totalPrice} className="text-lg font-semibold" prefix="Total" />;
}
