import {
  aggregateSalesByDish,
  mapMenuSummary,
  mapRevenueSeries,
  mapSalesRows,
  type PaidOrder,
} from "./ownerDashboardMappers";

export const getRevenueTotals = (paidOrders: PaidOrder[]) => ({
  paidOrdersCount: paidOrders.length,
  paidRevenueTotal: paidOrders.reduce((sum, order) => sum + Number(order.totalPrice), 0),
});

export const getOwnerDashboardStats = ({
  paidOrdersToday,
  menuItems,
}: {
  paidOrdersToday: PaidOrder[];
  menuItems: { isAvailable: boolean }[];
}) => {
  const salesByDish = aggregateSalesByDish(paidOrdersToday);
  const salesRows = mapSalesRows(salesByDish);

  return {
    ...getRevenueTotals(paidOrdersToday),
    salesRows,
    revenueChartData: mapRevenueSeries(salesRows),
    menuSummary: mapMenuSummary(menuItems),
  };
};
