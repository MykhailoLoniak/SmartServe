import { useCartStore } from "@/store/useCartStore";

export const useCartActions = () => {
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const updateCourse = useCartStore((state) => state.updateCourse);

  return { addItem, removeItem, clearCart, updateCourse };
};

export const useCartState = () => {
  const tableId = useCartStore((state) => state.tableId);
  const tableToken = useCartStore((state) => state.tableToken);
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);

  return { tableId, tableToken, items, totalPrice };
};

export const getTotalQuantity = (items: Array<{ quantity: number }>) =>
  items.reduce((sum, item) => sum + item.quantity, 0);
