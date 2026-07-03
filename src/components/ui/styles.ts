export const FIELD_LABEL_CLASS =
  "mb-1.5 block text-sm font-medium text-zinc-700";

export const NAV_LINK_CLASS =
  "rounded-md px-2.5 py-1.5 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300";

export const PUBLIC_NAV_LINK_CLASS =
  "rounded-md px-2.5 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900";

export const MOBILE_NAV_LINK_CLASS =
  "block rounded-lg px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300";

export const FIELD_CONTROL_CLASS =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500";

export const BUTTON_BASE_CLASS =
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export const BUTTON_VARIANT_CLASS = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950",
  secondary:
    "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100",
  ghost:
    "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-200",
  danger:
    "text-red-600 hover:bg-red-50 hover:text-red-700 active:bg-red-100 disabled:opacity-50",
} as const;

export const BUTTON_SIZE_CLASS = {
  sm: "px-3 py-1.5",
  md: "px-4 py-2",
  lg: "px-4 py-3 text-base",
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANT_CLASS;
export type ButtonSize = keyof typeof BUTTON_SIZE_CLASS;

export function cx(
  ...classNames: Array<string | false | null | undefined>
): string {
  return classNames.filter(Boolean).join(" ");
}
