import type { ReactNode } from "react";
import { cx } from "./styles";

type FormMessageProps = {
  variant: "error" | "success";
  children: ReactNode;
  className?: string;
};

const VARIANT_CLASS = {
  error: "border border-red-200 bg-red-50 text-red-700",
  success: "border border-emerald-200 bg-emerald-50 text-emerald-700",
} as const;

export function FormMessage({
  variant,
  children,
  className,
}: FormMessageProps) {
  return (
    <p
      role="alert"
      className={cx(
        "rounded-lg px-3 py-2.5 text-sm leading-relaxed",
        VARIANT_CLASS[variant],
        className,
      )}
    >
      {children}
    </p>
  );
}
