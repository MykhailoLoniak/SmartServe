import { CartFloatingContainer } from "./CartFloatingContainer";
import { MESSAGE_LAYOUT_CLASSES } from "./constants";

type CartEmptyIndicatorProps = {
  message: string;
};

export function CartEmptyIndicator({ message }: CartEmptyIndicatorProps) {
  return <CartFloatingContainer className={MESSAGE_LAYOUT_CLASSES}>{message}</CartFloatingContainer>;
}
