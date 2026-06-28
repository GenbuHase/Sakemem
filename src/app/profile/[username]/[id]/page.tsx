import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProfileAvatar } from "@/components/profiles/profile-avatar";
import { RecordDetail } from "@/components/records/record-detail";
import { buildPageMetadata } from "@/lib/metadata/build-metadata";
import { buildRecordShareMetadataInput } from "@/lib/metadata/record-share";
import { isFoodCategory } from "@/lib/constants/categories";
import { formatRecordDate } from "@/lib/utils/date";
import { createPublicClient } from "@/lib/supabase/public";
import { siteName } from "@/lib/metadata/site";
import {
  fetchSharedPairRecords,
  fetchSharedRecord,
} from "@/lib/sharing/fetch-shared";
import type { SakememRecord } from "@/lib/types/record";
import { sharedRecordToSakememRecord } from "@/lib/sharing/mask-record";

type SharedRecordPageProps = {
  params: Promise<{ username: string; id: string }>;
};

export async function generateMetadata({
  params,
}: SharedRecordPageProps): Promise<Metadata> {
  const { username, id } = await params;

  try {
    const supabase = createPublicClient();
    const shared = await fetchSharedRecord(supabase, username, id);

    if (!shared) {
      return {
        title: "記録が見つかりません",
        robots: { index: false, follow: false },
      };
    }

    let pairRecords: SakememRecord[] = [];
    if (shared.pair_id) {
      pairRecords = await fetchSharedPairRecords(
        supabase,
        username,
        shared.pair_id,
        shared.id,
      );
    }

    const meta = buildRecordShareMetadataInput(shared, pairRecords);
    return buildPageMetadata(meta);
  } catch {
    return {
      title: `記録 | ${siteName}`,
      robots: { index: false, follow: false },
    };
  }
}

export default async function SharedRecordPage({
  params,
}: SharedRecordPageProps) {
  const { username, id } = await params;
  const supabase = createPublicClient();
  const shared = await fetchSharedRecord(supabase, username, id);

  if (!shared) {
    notFound();
  }

  const mainRecord = sharedRecordToSakememRecord(shared);
  let pairRecords: SakememRecord[] = [];

  if (shared.pair_id) {
    pairRecords = await fetchSharedPairRecords(
      supabase,
      username,
      shared.pair_id,
      shared.id,
    );
  }

  const drinks = [mainRecord, ...pairRecords].filter(
    (record) => !isFoodCategory(record.category),
  );
  const foods = [mainRecord, ...pairRecords].filter((record) =>
    isFoodCategory(record.category),
  );
  const isPaired = drinks.length > 0 && foods.length > 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/@${shared.profile_username}`} className="flex items-center gap-2">
          <ProfileAvatar
            displayName={shared.profile_display_name}
            avatarUrl={shared.profile_avatar_url}
            size="sm"
          />
          <span className="text-sm text-zinc-700">
            {shared.profile_display_name}
            <span className="text-zinc-400"> @{shared.profile_username}</span>
          </span>
        </Link>
      </div>

      <time
        dateTime={shared.date}
        className="mb-3 block text-sm font-medium text-zinc-500"
      >
        {formatRecordDate(shared.date)}
      </time>

      {isPaired ? (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/80">
          <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-2">
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
              ペア
            </span>
          </div>
          <div className="grid gap-3 p-3 md:grid-cols-2">
            {drinks.map((record) => (
              <RecordDetail key={record.id} record={record} showActions={false} nested />
            ))}
            {foods.map((record) => (
              <RecordDetail key={record.id} record={record} showActions={false} nested />
            ))}
          </div>
        </div>
      ) : (
        <RecordDetail record={mainRecord} showActions={false} />
      )}
    </div>
  );
}
