import { RestaurantQuickLinks } from "./RestaurantQuickLinks";

type RestaurantsPageHeaderProps = {
  links: {
    dashboardHref: string;
    qrHref: string;
    ownerHref: string;
    kitchenHref: string;
    waiterHref: string;
  };
};

export function RestaurantsPageHeader({ links }: RestaurantsPageHeaderProps) {
  return (
    <header className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-bold text-black">Restaurant management</h1>
      <p className="mt-2 text-black/60">
        Choose the active restaurant for the dashboard, kitchen, and waitstaff. All data is displayed only for the selected
        restaurant.
      </p>
      <RestaurantQuickLinks links={links} />
    </header>
  );
}
