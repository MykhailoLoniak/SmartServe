export type PaidOrderItem = {
  quantity: number;
  priceAtTime: number | string;
  menuItem: {
    id: number;
    name: string;
  };
};

export type PaidOrder = {
  id: number;
  totalPrice: number | string;
  items: PaidOrderItem[];
};

export type SalesRow = {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
};

export const aggregateSalesByDish = (orders: PaidOrder[]) => {
  const salesByDish = new Map<string, SalesRow>();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const key = String(item.menuItem.id);
      const current = salesByDish.get(key) ?? {
        id: key,
        name: item.menuItem.name,
        quantity: 0,
        revenue: 0,
      };

      current.quantity += item.quantity;
      current.revenue += Number(item.priceAtTime) * item.quantity;
      salesByDish.set(key, current);
    });
  });

  return salesByDish;
};

export const mapSalesRows = (salesByDish: Map<string, SalesRow>) =>
  [...salesByDish.values()].sort((a, b) => b.revenue - a.revenue);

export const mapRevenueSeries = (salesRows: SalesRow[]) =>
  salesRows.map((row) => ({
    label: row.name,
    value: row.revenue,
  }));

export const mapMenuSummary = (menuItems: { isAvailable: boolean }[]) => {
  const availableCount = menuItems.filter((item) => item.isAvailable).length;

  return {
    totalCount: menuItems.length,
    availableCount,
    unavailableCount: menuItems.length - availableCount,
  };
};
