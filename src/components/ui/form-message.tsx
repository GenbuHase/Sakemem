import type { ReactNode } from "react";
import { cx } from "./styles";

type FormMessageProps = {
  variant: "error" | "success";
  children: ReactNode;
  className?: string;
};

const VARIANT_CLASS = {
  error: "bg-red-50 text-red-700",
  success: "bg-emerald-50 text-emerald-700",
} as const;

export function FormMessage({
  variant,
  children,
  className,
}: FormMessageProps) {
  return (
    <p
      className={cx(
        "rounded-lg px-3 py-2 text-sm",
        VARIANT_CLASS[variant],
        className,
      )}
    >
      {children}
    </p>
  );
}
