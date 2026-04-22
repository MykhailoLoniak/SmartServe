type CartButtonBadgeProps = {
  quantity: number;
};

export function CartButtonBadge({ quantity }: CartButtonBadgeProps) {
  return <p className="text-sm text-white/80">Кількість страв: {quantity}</p>;
}
