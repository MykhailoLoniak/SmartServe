import { formatPrice } from "@/lib/cart/cartFormatters";

type CartPriceDisplayProps = {
  amount: number;
  className?: string;
  prefix?: string;
};

export function CartPriceDisplay({ amount, className = "", prefix }: CartPriceDisplayProps) {
  return (
    <p className={className}>
      {prefix ? `${prefix}: ` : ""}
      {formatPrice(amount)}
    </p>
  );
}
