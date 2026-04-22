export const restaurantCardStyles = {
  base: "rounded-xl border p-4",
  activeCard: "border-black bg-black/95 text-white",
  inactiveCard: "border-black/10 bg-[#f7f7f8] text-black",
  activeMutedText: "text-white/70",
  inactiveMutedText: "text-black/60",
  activeLabel: "text-white/80",
  inactiveLabel: "text-black/70",
  activeDeleteButton: "border-red-300 bg-red-500/20 text-red-100 hover:bg-red-500/30",
  inactiveDeleteButton: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
} as const;

export const getRestaurantCardClassName = (isActive: boolean) =>
  `${restaurantCardStyles.base} ${isActive ? restaurantCardStyles.activeCard : restaurantCardStyles.inactiveCard}`;

export const getMutedTextClassName = (isActive: boolean) =>
  isActive ? restaurantCardStyles.activeMutedText : restaurantCardStyles.inactiveMutedText;

export const getLabelClassName = (isActive: boolean) =>
  isActive ? restaurantCardStyles.activeLabel : restaurantCardStyles.inactiveLabel;

export const getDeleteButtonClassName = (isActive: boolean) =>
  isActive ? restaurantCardStyles.activeDeleteButton : restaurantCardStyles.inactiveDeleteButton;
