import { COURSE_BADGE_CLASSNAMES } from "../helpers/kitchenBoardMappers";

type KitchenStatusBadgeProps = {
  course: number;
};

export function KitchenStatusBadge({ course }: KitchenStatusBadgeProps) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        COURSE_BADGE_CLASSNAMES[course] ?? "bg-neutral-200 text-neutral-700"
      }`}
    >
      Курс {course}
    </span>
  );
}
