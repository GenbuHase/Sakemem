export const FIELD_LABEL_CLASS =
  "mb-1.5 block text-sm font-medium text-zinc-700";

export const FIELD_CONTROL_CLASS =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-50";

export const BUTTON_BASE_CLASS =
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";

export const BUTTON_VARIANT_CLASS = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-800",
  secondary:
    "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100",
  ghost: "text-zinc-700 hover:text-zinc-900",
  danger:
    "text-red-600 hover:text-red-700 disabled:opacity-50",
} as const;

export const BUTTON_SIZE_CLASS = {
  sm: "px-3 py-1.5",
  md: "px-4 py-2",
  lg: "px-4 py-3",
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANT_CLASS;
export type ButtonSize = keyof typeof BUTTON_SIZE_CLASS;

export function cx(
  ...classNames: Array<string | false | null | undefined>
): string {
  return classNames.filter(Boolean).join(" ");
}
