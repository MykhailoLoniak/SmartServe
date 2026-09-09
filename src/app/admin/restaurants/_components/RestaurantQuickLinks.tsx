import Link from "next/link";

type RestaurantQuickLinksProps = {
  links: {
    dashboardHref: string;
    qrHref: string;
    ownerHref: string;
    kitchenHref: string;
    waiterHref: string;
  };
};

const linkClassName = "rounded-lg border border-black/10 bg-white px-3 py-2 text-black";

export function RestaurantQuickLinks({ links }: RestaurantQuickLinksProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-3 text-sm">
      <Link href={links.dashboardHref} className="rounded-lg border border-black/10 bg-black px-3 py-2 text-white">
        Manager dashboard
      </Link>
      <Link href={links.qrHref} className={linkClassName}>
        Open QR generator
      </Link>
      <Link href={links.ownerHref} className={linkClassName}>
        Owner dashboard
      </Link>
      <Link href={links.kitchenHref} className={linkClassName}>
        Kitchen
      </Link>
      <Link href={links.waiterHref} className={linkClassName}>
        Waiter
      </Link>
    </div>
  );
}
