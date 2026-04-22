import { type CartCourse } from "@/store/useCartStore";

export const COURSE_OPTIONS: Array<{ value: CartCourse; label: string; className: string }> = [
  { value: 1, label: "Курс 1", className: "border-amber-300 text-amber-700" },
  { value: 2, label: "Курс 2", className: "border-violet-300 text-violet-700" },
  { value: 3, label: "Курс 3 / Десерт", className: "border-sky-300 text-sky-700" },
];

export const FLOATING_LAYOUT_CLASSES =
  "fixed bottom-4 left-4 right-4 z-40 rounded-2xl bg-black px-5 py-4 text-left text-white shadow-lg md:left-auto md:right-8 md:w-[360px]";

export const MESSAGE_LAYOUT_CLASSES =
  "fixed bottom-4 left-4 right-4 z-50 rounded-xl bg-black px-4 py-3 text-sm text-white shadow-lg md:left-auto md:right-8 md:w-[360px]";
