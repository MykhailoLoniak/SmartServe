const withRestaurantSlug = (slug: string | null, path: string) => (slug ? `/${slug}${path}` : path);

export const getRestaurantDashboardLinks = (restaurantSlug: string | null) => ({
  dashboardHref: withRestaurantSlug(restaurantSlug, "/admin/dashboard"),
  qrHref: withRestaurantSlug(restaurantSlug, "/admin/qr"),
  ownerHref: withRestaurantSlug(restaurantSlug, "/admin/owner"),
  kitchenHref: withRestaurantSlug(restaurantSlug, "/staff/kitchen"),
  waiterHref: withRestaurantSlug(restaurantSlug, "/staff/waiter"),
});
