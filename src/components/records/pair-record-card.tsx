import type { SakememRecord } from "@/lib/types/record";
import { RecordDetail } from "./record-detail";

type PairRecordCardProps = {
  drinks: SakememRecord[];
  foods: SakememRecord[];
  showActions?: boolean;
  shareUsername?: string | null;
  pairRecords?: SakememRecord[];
  showCounts?: boolean;
  gridClassName?: string;
};

export function PairRecordCard({
  drinks,
  foods,
  showActions = true,
  shareUsername = null,
  pairRecords = [],
  showCounts = true,
  gridClassName = "sm:grid-cols-2",
}: PairRecordCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/80">
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-2">
        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
          ペア
        </span>
        {showCounts ? (
          <span className="text-xs text-zinc-500">
            お酒 {drinks.length} · おつまみ {foods.length}
          </span>
        ) : null}
      </div>
      <div className={`grid gap-3 p-3 ${gridClassName}`}>
        {drinks.map((record) => (
          <RecordDetail
            key={record.id}
            record={record}
            nested
            className="h-full"
            showActions={showActions}
            shareUsername={shareUsername}
            pairRecords={pairRecords}
          />
        ))}
        {foods.map((record) => (
          <RecordDetail
            key={record.id}
            record={record}
            nested
            className="h-full"
            showActions={showActions}
            shareUsername={shareUsername}
            pairRecords={pairRecords}
          />
        ))}
      </div>
    </div>
  );
}
