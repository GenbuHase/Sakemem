import type { LucideIcon } from "lucide-react";

type RecordMetadataRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export function RecordMetadataRow({
  icon: Icon,
  label,
  value,
}: RecordMetadataRowProps) {
  return (
    <div className="flex min-w-0 items-start gap-2 text-sm">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-zinc-400"
        aria-hidden
      />
      <span className="w-16 shrink-0 pt-0.5 text-xs text-zinc-400">
        {label}
      </span>
      <span className="min-w-0 flex-1 break-words text-zinc-600">
        {value}
      </span>
    </div>
  );
}
