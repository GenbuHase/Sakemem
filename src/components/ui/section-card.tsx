import type { ReactNode } from "react";
import { cx } from "./styles";

type SectionCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  variant?: "default" | "muted";
  className?: string;
};

const VARIANT_CLASS = {
  default: "border-zinc-200 bg-white",
  muted: "border-zinc-200 bg-zinc-50",
} as const;

export function SectionCard({
  title,
  description,
  children,
  variant = "default",
  className,
}: SectionCardProps) {
  return (
    <section
      className={cx(
        "rounded-xl border p-5",
        VARIANT_CLASS[variant],
        className,
      )}
    >
      {title ? (
        <div className={children ? "mb-4" : undefined}>
          <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-zinc-500">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
