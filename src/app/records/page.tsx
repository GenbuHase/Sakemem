import type { Metadata } from "next";
import { getRecords } from "@/app/actions/records";
import { TimelineContainer } from "@/components/records/timeline-container";
import { LinkButton } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth/require-user";
import { parseRecordFilters } from "@/lib/records/filter-records";

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

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="タイムライン"
        description="過去の晩酌記録を振り返れます。"
        action={<LinkButton href="/records/new">記録する</LinkButton>}
      />

      <TimelineContainer allRecords={allRecords} initialFilters={filters} />
    </div>
  );
}
