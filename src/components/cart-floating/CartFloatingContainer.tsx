import { type ReactNode } from "react";

type CartFloatingContainerProps = {
  children: ReactNode;
  className: string;
};

export function CartFloatingContainer({ children, className }: CartFloatingContainerProps) {
  return <div className={className}>{children}</div>;
}
