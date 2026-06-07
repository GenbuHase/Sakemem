import Link from "next/link";
import { getCategoryLabel } from "@/lib/constants/categories";
import { FLAVOR_METRICS_BY_CATEGORY } from "@/lib/constants/flavor-metrics";
import type { SakememRecord } from "@/lib/types/record";
import { DeleteRecordButton } from "./delete-record-button";
import { RatingDisplay } from "./rating-display";

type RecordDetailProps = {
  record: SakememRecord;
  showActions?: boolean;
};

export function RecordDetail({ record, showActions = true }: RecordDetailProps) {
  const flavorDefs = FLAVOR_METRICS_BY_CATEGORY[record.category];
  const filledMetrics = flavorDefs.filter(
    ({ key }) => record.flavor_metrics[key] !== undefined,
  );

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
            {getCategoryLabel(record.category)}
          </span>
          <h3 className="mt-2 text-lg font-semibold text-zinc-900">
            {record.name}
          </h3>
          {record.sub_info ? (
            <p className="mt-1 text-sm text-zinc-500">{record.sub_info}</p>
          ) : null}
        </div>
        {showActions ? (
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href={`/records/${record.id}/edit`}
              className="text-sm font-medium text-zinc-700 transition hover:text-zinc-900"
            >
              編集
            </Link>
            <DeleteRecordButton id={record.id} pairId={record.pair_id} />
          </div>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
            評価
          </p>
          <div className="mt-1">
            <RatingDisplay rating={record.rating} />
          </div>
        </div>

        {filledMetrics.length > 0 ? (
          <div>
            <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              味の評価
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {filledMetrics.map(({ key, label }) => (
                <span
                  key={key}
                  className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700"
                >
                  {label}: {record.flavor_metrics[key]}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {record.comment ? (
          <div>
            <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              メモ
            </p>
            <p className="mt-1 text-sm leading-6 text-zinc-700">
              {record.comment}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
