import type { Metadata } from "next";
import { getRecords } from "@/app/actions/records";
import { RecordFiltersForm } from "@/components/records/record-filters";
import { RecordStats } from "@/components/records/record-stats";
import { Timeline } from "@/components/records/timeline";
import { LinkButton } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
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
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="タイムライン"
        description="過去の晩酌記録を振り返れます。"
        action={<LinkButton href="/records/new">記録する</LinkButton>}
      />

      <div className="space-y-6">
        <RecordFiltersForm filters={filters} />
        {!isFiltered ? <RecordStats analysis={analysis} /> : null}

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
