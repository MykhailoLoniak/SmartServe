import { type CartCourse } from "@/store/useCartStore";

import { COURSE_OPTIONS } from "./constants";

type CartCourseSelectorProps = {
  itemId: string;
  selectedCourse: CartCourse;
  disabled: boolean;
  onSelect: (itemId: string, course: CartCourse) => void;
};

export function CartCourseSelector({
  itemId,
  selectedCourse,
  disabled,
  onSelect,
}: CartCourseSelectorProps) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/50">Serving order</p>
      <div className="flex flex-wrap gap-2">
        {COURSE_OPTIONS.map((option) => {
          const isSelected = option.value === selectedCourse;

          return (
            <button
              key={`${itemId}-course-${option.value}`}
              type="button"
              onClick={() => onSelect(itemId, option.value)}
              disabled={disabled}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isSelected
                  ? `${option.className} bg-white`
                  : "border-black/10 text-black/55 hover:border-black/25 hover:text-black/70"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
