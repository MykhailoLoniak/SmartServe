export const formatOrderTime = (dateTime: string) =>
  new Date(dateTime).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 2,
  }).format(amount);
