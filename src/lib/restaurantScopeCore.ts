export const resolveRestaurantIdScope = (scopedRestaurantId: number | undefined, activeRestaurantId: number) =>
  scopedRestaurantId ?? activeRestaurantId;
