import type { ReactNode } from "react";
import { LinkButton } from "@/components/ui/button";

type EmptyStateVariant =
  | "timeline-empty"
  | "timeline-filtered"
  | "public-profile-empty";

type EmptyStateProps = {
  variant: EmptyStateVariant;
};

const CONTENT: Record<
  EmptyStateVariant,
  { title: string; description: string; action?: ReactNode }
> = {
  "timeline-empty": {
    title: "まだ記録がありません",
    description: "最初の晩酌を記録してみましょう。",
    action: <LinkButton href="/records/new">記録する</LinkButton>,
  },
  "timeline-filtered": {
    title: "条件に一致する記録がありません",
    description: "検索条件を変えてお試しください。",
  },
  "public-profile-empty": {
    title: "まだ公開されている記録はありません",
    description: "",
  },
};

export function EmptyState({ variant }: EmptyStateProps) {
  const { title, description, action } = CONTENT[variant];

  if (variant === "public-profile-empty") {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
        <p className="text-sm text-zinc-600">{title}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
      <p className="text-sm font-medium text-zinc-700">{title}</p>
      {description ? (
        <p className="mt-1.5 text-sm text-zinc-500">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
