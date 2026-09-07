import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItemInput = {
  id: string;
  name: string;
  price: number | string;
};

export type CartCourse = 1 | 2 | 3;

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  course: CartCourse;
};

type CartStore = {
  tableId: number | null;
  tableToken: string | null;
  items: CartItem[];
  totalPrice: number;
  setTableContext: (tableId: number | null, tableToken: string | null) => void;
  addItem: (item: CartItemInput) => void;
  removeItem: (id: string) => void;
  updateCourse: (id: string, course: CartCourse) => void;
  clearCart: () => void;
};

const calculateTotalPrice = (items: CartItem[]) =>
  items.reduce((total, item) => total + Number(item.price) * item.quantity, 0);

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      tableId: null,
      tableToken: null,
      items: [],
      totalPrice: 0,
      setTableContext: (tableId, tableToken) =>
        set((state) => {
          if (state.tableId === tableId && state.tableToken === tableToken) {
            return state;
          }

          return {
            tableId,
            tableToken,
            items: [],
            totalPrice: 0,
          };
        }),
      addItem: (item) =>
        set((state) => {
          const normalizedPrice = Number(item.price);
          const existingItem = state.items.find(
            (cartItem) => cartItem.id === item.id,
          );

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
                  course: 1 as CartCourse,
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
                  item.id === id
                    ? { ...item, quantity: item.quantity - 1 }
                    : item,
                )
              : state.items.filter((item) => item.id !== id);

          return {
            items,
            totalPrice: calculateTotalPrice(items),
          };
        }),
      updateCourse: (id, course) =>
        set((state) => {
          const items = state.items.map((item) =>
            item.id === id ? { ...item, course } : item,
          );

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
    }),
    {
      name: "smartserve-cart-store",
      partialize: (state) => ({
        tableId: state.tableId,
        tableToken: state.tableToken,
        items: state.items,
        totalPrice: state.totalPrice,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CartStore> | undefined;
        const persistedItems = persisted?.items ?? [];

        const normalizedItems = persistedItems.map((item) => ({
          ...item,
          course: (item.course ?? 1) as CartCourse,
        }));

        return {
          ...currentState,
          ...persisted,
          items: normalizedItems,
          totalPrice: calculateTotalPrice(normalizedItems),
        };
      },
    },
  ),
);
