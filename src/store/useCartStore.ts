import { create } from "zustand";

type CartItemInput = {
  id: string;
  name: string;
  price: number | string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  totalPrice: number;
  addItem: (item: CartItemInput) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const calculateTotalPrice = (items: CartItem[]) =>
  items.reduce((total, item) => total + Number(item.price) * item.quantity, 0);

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  totalPrice: 0,
  addItem: (item) =>
    set((state) => {
      const normalizedPrice = Number(item.price);
      const existingItem = state.items.find((cartItem) => cartItem.id === item.id);

      const items = existingItem
        ? state.items.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem,
          )
        : [
            ...state.items,
            {
              id: item.id,
              name: item.name,
              price: normalizedPrice,
              quantity: 1,
            },
          ];

      return {
        items,
        totalPrice: calculateTotalPrice(items),
      };
    }),
  removeItem: (id) =>
    set((state) => {
      const target = state.items.find((item) => item.id === id);

      if (!target) {
        return state;
      }

      const items =
        target.quantity > 1
          ? state.items.map((item) =>
              item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
            )
          : state.items.filter((item) => item.id !== id);

      return {
        items,
        totalPrice: calculateTotalPrice(items),
      };
    }),
  clearCart: () =>
    set({
      items: [],
      totalPrice: 0,
    }),
}));
