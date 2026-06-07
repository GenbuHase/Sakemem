import type { TimelineEntry } from "@/lib/records/group-timeline";
import { formatRecordDate } from "@/lib/utils/date";
import { RecordDetail } from "./record-detail";

type TimelineProps = {
  entries: TimelineEntry[];
  filtered?: boolean;
};

export function Timeline({ entries, filtered = false }: TimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
        <p className="text-sm text-zinc-500">
          {filtered
            ? "条件に一致する記録がありません。"
            : "まだ記録がありません。"}
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          {filtered
            ? "検索条件を変えてお試しください。"
            : "最初の晩酌を記録してみましょう。"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <article key={entry.kind === "single" ? entry.record.id : entry.pairId}>
          <time className="mb-3 block text-sm font-medium text-zinc-500">
            {formatRecordDate(entry.date)}
          </time>

          {entry.kind === "single" ? (
            <RecordDetail record={entry.record} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {entry.drinks.map((record) => (
                <RecordDetail key={record.id} record={record} />
              ))}
              {entry.foods.map((record) => (
                <RecordDetail key={record.id} record={record} />
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
