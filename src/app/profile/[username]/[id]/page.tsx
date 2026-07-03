import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SharedRecordAuthor } from "@/components/records/shared-record-author";
import { SharedRecordContent } from "@/components/records/shared-record-content";
import { buildPageMetadata } from "@/lib/metadata/build-metadata";
import { buildRecordShareMetadataInput } from "@/lib/metadata/record-share";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const shared = await fetchSharedRecord(supabase, username, id);

  if (!shared) {
    return { title: "記録が見つかりません" };
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
}

export default async function SharedRecordPage({
  params,
}: SharedRecordPageProps) {
  const { username, id } = await params;
  const supabase = await createClient();
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

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <SharedRecordAuthor
        username={shared.profile_username}
        displayName={shared.profile_display_name}
        avatarUrl={shared.profile_avatar_url}
      />

      <SharedRecordContent
        mainRecord={mainRecord}
        pairRecords={pairRecords}
        date={shared.date}
      />
    </div>
  );
}
