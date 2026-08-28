import Link from "next/link";
import { getCategoryLabel } from "@/lib/constants/categories";
import {
  STYLE_AWARE_FLAVOR_LABELS,
  hasDrinkStyles,
} from "@/lib/constants/drink-styles";
import { getFlavorMetricDefs } from "@/lib/constants/flavor-metrics";
import type { SakememRecord } from "@/lib/types/record";
import { cx } from "@/components/ui/styles";
import { DeleteRecordButton } from "./delete-record-button";
import { RecordMetadata } from "./record-metadata";
import { RatingDisplay } from "./rating-display";
import { SpaEditLink } from "./spa-edit-link";
import { ShareButton } from "@/components/sharing/share-button";

type RecordDetailProps = {
  record: SakememRecord;
  showActions?: boolean;
  nested?: boolean;
  shareUsername?: string | null;
  pairRecords?: SakememRecord[];
  author?: {
    username: string;
    displayName: string;
    href?: string;
  };
  className?: string;
};

export function RecordDetail({
  record,
  showActions = true,
  nested = false,
  shareUsername = null,
  pairRecords = [],
  author,
  className,
}: RecordDetailProps) {
  const flavorDefs = buildFlavorMetricDefs(record);
  const filledMetrics = flavorDefs.filter(
    ({ key }) => record.flavor_metrics[key] !== undefined,
  );

  return (
    <div
      className={cx(
        "rounded-xl border border-zinc-200 bg-white p-4",
        !nested && "shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {author ? (
            <Link
              href={author.href ?? `/@${author.username}`}
              className="mb-2 inline-block text-xs text-zinc-500 hover:text-zinc-700"
            >
              {author.displayName} @{author.username}
            </Link>
          ) : null}
          <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
            {getCategoryLabel(record.category)}
          </span>
          <h3 className="mt-2 break-words text-base font-semibold text-zinc-900">
            {record.name}
          </h3>
        </div>
        {showActions ? (
          <div className="flex shrink-0 items-center gap-1">
            <SpaEditLink
              href={`/records/${record.id}/edit`}
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              編集
            </SpaEditLink>
            <DeleteRecordButton id={record.id} pairId={record.pair_id} />
          </div>
        ) : null}
      </div>
      <RecordMetadata record={record} />

      {showActions &&
      shareUsername &&
      (record.visibility === "unlisted" || record.visibility === "public") ? (
        <div className="mt-3 border-t border-zinc-100 pt-3">
          <ShareButton
            record={record}
            username={shareUsername}
            pairRecords={pairRecords}
          />
        </div>
      ) : null}

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
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
              {record.comment}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function buildFlavorMetricDefs(record: SakememRecord) {
  const defsByKey = new Map(
    getFlavorMetricDefs(record.category, record.style).map((def) => [
      def.key,
      def,
    ]),
  );

  if (!hasDrinkStyles(record.category)) {
    return Array.from(defsByKey.values());
  }

  const fallbackLabels = STYLE_AWARE_FLAVOR_LABELS[record.category] ?? {};

  for (const key of Object.keys(record.flavor_metrics)) {
    if (!defsByKey.has(key) && fallbackLabels[key]) {
      defsByKey.set(key, { key, label: fallbackLabels[key] });
    }
  }

  return Array.from(defsByKey.values());
}
