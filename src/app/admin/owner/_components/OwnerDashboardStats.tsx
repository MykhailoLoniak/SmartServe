type OwnerDashboardStatsProps = {
  activeOrdersCount: number;
  completedOrdersCount: number;
  menuSummary: {
    totalCount: number;
    availableCount: number;
    unavailableCount: number;
  };
};

export function OwnerDashboardStats({ activeOrdersCount, completedOrdersCount, menuSummary }: OwnerDashboardStatsProps) {
  const stats = [
    { label: "Active orders", value: activeOrdersCount },
    { label: "Completed orders", value: completedOrdersCount },
    { label: "Menu items", value: menuSummary.totalCount },
    { label: "Available items", value: menuSummary.availableCount },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <article key={stat.label} className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-sm text-black/60">{stat.label}</p>
          <p className="mt-1 text-2xl font-bold text-black">{stat.value}</p>
        </article>
      ))}
    </section>
  );
}
