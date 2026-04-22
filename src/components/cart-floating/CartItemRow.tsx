import { type CartItem, type CartCourse } from "@/store/useCartStore";
import { formatItemPriceLine } from "@/lib/cart/cartFormatters";

import { CartCourseSelector } from "./CartCourseSelector";

type CartItemRowProps = {
  item: CartItem;
  disabled: boolean;
  onRemove: (id: string) => void;
  onAdd: (item: Pick<CartItem, "id" | "name" | "price">) => void;
  onCourseChange: (id: string, course: CartCourse) => void;
};

const ACTION_BUTTON_CLASS =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-black/20 text-sm font-semibold transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60";

export function CartItemRow({ item, disabled, onRemove, onAdd, onCourseChange }: CartItemRowProps) {
  return (
    <li className="space-y-3 rounded-xl border border-black/10 p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-black/60">{formatItemPriceLine(item.quantity, item.price)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className={ACTION_BUTTON_CLASS}
            disabled={disabled}
            aria-label={`Відняти одну порцію ${item.name}`}
          >
            -
          </button>

          <button
            type="button"
            onClick={() => onAdd({ id: item.id, name: item.name, price: item.price })}
            className={ACTION_BUTTON_CLASS}
            disabled={disabled}
            aria-label={`Додати ще одну порцію ${item.name}`}
          >
            +
          </button>
        </div>
      </div>

      <CartCourseSelector
        itemId={item.id}
        selectedCourse={item.course}
        disabled={disabled}
        onSelect={onCourseChange}
      />
    </li>
  );
}
