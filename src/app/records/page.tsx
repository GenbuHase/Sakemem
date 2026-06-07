import type { Metadata } from "next";
import { getRecords } from "@/app/actions/records";
import { RecordFiltersForm } from "@/components/records/record-filters";
import { RecordStats } from "@/components/records/record-stats";
import { Timeline } from "@/components/records/timeline";
import { LinkButton } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/require-user";
import { analyzeRecords } from "@/lib/records/analyze-records";
import {
  filterRecords,
  hasActiveFilters,
  parseRecordFilters,
} from "@/lib/records/filter-records";
import { groupRecordsForTimeline } from "@/lib/records/group-timeline";

export const metadata: Metadata = {
  title: "タイムライン | Sakemem",
};

type RecordsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  await requireUser();
  const filters = parseRecordFilters(await searchParams);
  const allRecords = await getRecords();
  const filteredRecords = filterRecords(allRecords, filters);
  const entries = groupRecordsForTimeline(filteredRecords);
  const analysis = analyzeRecords(allRecords);
  const isFiltered = hasActiveFilters(filters);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            タイムライン
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            過去の晩酌記録を振り返れます。
          </p>
        </div>
        <LinkButton href="/records/new" className="shrink-0">
          記録する
        </LinkButton>
      </div>

      <div className="space-y-6">
        <RecordFiltersForm filters={filters} />
        <RecordStats analysis={analysis} />

        {isFiltered ? (
          <p className="text-sm text-zinc-500">
            {filteredRecords.length}件の記録が見つかりました
          </p>
        ) : null}

        <Timeline entries={entries} filtered={isFiltered} />
      </div>
    </div>
  );
}
