import type { TimelineEntry } from "@/lib/records/group-timeline";
import { formatRecordDate } from "@/lib/utils/date";
import { LinkButton } from "@/components/ui/button";
import { RecordDetail } from "./record-detail";

type TimelineProps = {
  entries: TimelineEntry[];
  filtered?: boolean;
};

export function Timeline({ entries, filtered = false }: TimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
        <p className="text-sm font-medium text-zinc-700">
          {filtered
            ? "条件に一致する記録がありません"
            : "まだ記録がありません"}
        </p>
        <p className="mt-1.5 text-sm text-zinc-500">
          {filtered
            ? "検索条件を変えてお試しください。"
            : "最初の晩酌を記録してみましょう。"}
        </p>
        {!filtered ? (
          <div className="mt-6">
            <LinkButton href="/records/new">記録する</LinkButton>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {entries.map((entry) => (
        <article key={entry.kind === "single" ? entry.record.id : entry.pairId}>
          <time
            dateTime={entry.date}
            className="mb-3 block text-sm font-medium text-zinc-500"
          >
            {formatRecordDate(entry.date)}
          </time>

          {entry.kind === "single" ? (
            <div className="grid gap-3 md:grid-cols-2">
              <RecordDetail record={entry.record} />
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/80">
              <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-2">
                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                  ペア
                </span>
                <span className="text-xs text-zinc-500">
                  お酒 {entry.drinks.length} · おつまみ {entry.foods.length}
                </span>
              </div>
              <div className="grid gap-3 p-3 md:grid-cols-2">
                {entry.drinks.map((record) => (
                  <RecordDetail key={record.id} record={record} nested />
                ))}
                {entry.foods.map((record) => (
                  <RecordDetail key={record.id} record={record} nested />
                ))}
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
