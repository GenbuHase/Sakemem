import Link from "next/link";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  action?: ReactNode;
};

export function PageHeader({
  title,
  description,
  backHref,
  backLabel = "戻る",
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div className="min-w-0">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            <span aria-hidden="true">←</span>
            {backLabel}
          </Link>
        ) : null}
        <h1
          className={`text-2xl font-semibold tracking-tight text-zinc-900 ${backHref ? "mt-3" : ""}`}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 pt-1">{action}</div> : null}
    </div>
  );
}
