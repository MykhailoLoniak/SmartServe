export const formatOrderTime = (dateTime: string) =>
  new Date(dateTime).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 2,
  }).format(amount);
