import {
  groupTimelineEntriesByDate,
  type TimelineEntry,
} from "@/lib/records/group-timeline";
import type { SakememRecord } from "@/lib/types/record";
import { formatRecordDate } from "@/lib/utils/date";
import { EmptyState } from "@/components/ui/empty-state";
import { PairRecordCard } from "./pair-record-card";
import { RecordDetail } from "./record-detail";

type TimelineProps = {
  entries: TimelineEntry[];
  filtered?: boolean;
  shareUsername?: string | null;
  showActions?: boolean;
};

function getPairRecordsForEntry(entry: TimelineEntry): SakememRecord[] {
  if (entry.kind === "paired") {
    return [...entry.drinks, ...entry.foods];
  }
  return [entry.record];
}

export function Timeline({
  entries,
  filtered = false,
  shareUsername = null,
  showActions = true,
}: TimelineProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        variant={filtered ? "timeline-filtered" : "timeline-empty"}
      />
    );
  }

  const dateGroups = groupTimelineEntriesByDate(entries);

  return (
    <div className="space-y-8">
      {dateGroups.map((group) => (
        <section key={group.date}>
          <time
            dateTime={group.date}
            className="mb-4 block text-sm font-medium text-zinc-500"
          >
            {formatRecordDate(group.date)}
          </time>

          <div className="grid gap-3 lg:grid-cols-2">
            {group.entries.map((entry) => (
              <article
                key={entry.kind === "single" ? entry.record.id : entry.pairId}
                className={`timeline-entry ${
                  entry.kind === "paired" ? "col-span-full" : "h-full"
                }`}
              >
                {entry.kind === "single" ? (
                  <RecordDetail
                    className="h-full"
                    record={entry.record}
                    showActions={showActions}
                    shareUsername={shareUsername}
                    pairRecords={getPairRecordsForEntry(entry)}
                  />
                ) : (
                  <PairRecordCard
                    drinks={entry.drinks}
                    foods={entry.foods}
                    showActions={showActions}
                    shareUsername={shareUsername}
                    pairRecords={getPairRecordsForEntry(entry)}
                  />
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
