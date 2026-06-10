import Link from "next/link";
import { getCategoryLabel } from "@/lib/constants/categories";
import { getFlavorMetricDefs } from "@/lib/constants/flavor-metrics";
import {
  WINE_FLAVOR_METRIC_LABELS,
  decodeWineSubInfo,
} from "@/lib/constants/wine";
import type { SakememRecord } from "@/lib/types/record";
import { cx } from "@/components/ui/styles";
import { DeleteRecordButton } from "./delete-record-button";
import { RatingDisplay } from "./rating-display";

type RecordDetailProps = {
  record: SakememRecord;
  showActions?: boolean;
  nested?: boolean;
};

export function RecordDetail({
  record,
  showActions = true,
  nested = false,
}: RecordDetailProps) {
  const wineSubInfo =
    record.category === "wine" ? decodeWineSubInfo(record.sub_info) : null;
  const flavorDefs =
    record.category === "wine"
      ? buildWineFlavorMetricDefs(
          record.flavor_metrics,
          wineSubInfo?.style ?? null,
        )
      : getFlavorMetricDefs(record.category);
  const filledMetrics = flavorDefs.filter(
    ({ key }) => record.flavor_metrics[key] !== undefined,
  );

  return (
    <div
      className={cx(
        "rounded-xl border border-zinc-200 bg-white p-4",
        !nested && "shadow-sm",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
            {getCategoryLabel(record.category)}
          </span>
          <h3 className="mt-2 text-base font-semibold text-zinc-900">
            {record.name}
          </h3>
          {record.producer ? (
            <p className="mt-0.5 truncate text-sm text-zinc-500">
              {record.producer}
            </p>
          ) : null}
          {record.sub_info ? (
            <p className="mt-0.5 truncate text-sm text-zinc-500">
              {record.sub_info}
            </p>
          ) : null}
          {record.place ? (
            <p className="mt-0.5 truncate text-sm text-zinc-400">
              {record.place}
            </p>
          ) : null}
        </div>
        {showActions ? (
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href={`/records/${record.id}/edit`}
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              編集
            </Link>
            <DeleteRecordButton id={record.id} pairId={record.pair_id} />
          </div>
        ) : null}
      </div>

      <div className="mt-4 space-y-3 border-t border-zinc-100 pt-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-zinc-500">評価</p>
          <RatingDisplay rating={record.rating} />
        </div>

        {filledMetrics.length > 0 ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-zinc-500">味の評価</p>
            <div className="flex flex-wrap justify-end gap-1.5">
              {filledMetrics.map(({ key, label }) => (
                <span
                  key={key}
                  className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600"
                >
                  {label} {record.flavor_metrics[key]}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {record.comment ? (
          <div>
            <p className="text-xs font-medium text-zinc-500">メモ</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-700">
              {record.comment}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function buildWineFlavorMetricDefs(
  flavorMetrics: SakememRecord["flavor_metrics"],
  wineStyle: ReturnType<typeof decodeWineSubInfo>["style"],
) {
  const defsByKey = new Map(
    getFlavorMetricDefs("wine", wineStyle).map((def) => [def.key, def]),
  );

  for (const key of Object.keys(flavorMetrics)) {
    if (!defsByKey.has(key) && WINE_FLAVOR_METRIC_LABELS[key]) {
      defsByKey.set(key, { key, label: WINE_FLAVOR_METRIC_LABELS[key] });
    }
  }

  return Array.from(defsByKey.values());
}
