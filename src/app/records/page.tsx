import type { Metadata } from "next";
import Link from "next/link";
import { getRecords } from "@/app/actions/records";
import { Timeline } from "@/components/records/timeline";
import { requireUser } from "@/lib/auth/require-user";
import { groupRecordsForTimeline } from "@/lib/records/group-timeline";

export const metadata: Metadata = {
  title: "タイムライン | Sakemem",
};

export default async function RecordsPage() {
  await requireUser();
  const records = await getRecords();
  const entries = groupRecordsForTimeline(records);

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
        <Link
          href="/records/new"
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          記録する
        </Link>
      </div>

      <Timeline entries={entries} />
    </div>
  );
}
