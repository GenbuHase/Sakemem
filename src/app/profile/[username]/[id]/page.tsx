import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SharedRecordAuthor } from "@/components/records/shared-record-author";
import { SharedRecordContent } from "@/components/records/shared-record-content";
import { buildPageMetadata } from "@/lib/metadata/build-metadata";
import { buildRecordShareMetadataInput } from "@/lib/metadata/record-share";
import { getSharedRecordPageData } from "@/lib/sharing/public-data";
import { sharedRecordToSakememRecord } from "@/lib/sharing/mask-record";

type SharedRecordPageProps = {
  params: Promise<{ username: string; id: string }>;
};

export async function generateMetadata({
  params,
}: SharedRecordPageProps): Promise<Metadata> {
  const { username, id } = await params;
  const { record, pairRecords } = await getSharedRecordPageData(username, id);

  if (!record) {
    return { title: "記録が見つかりません" };
  }

  const meta = buildRecordShareMetadataInput(record, pairRecords);
  return buildPageMetadata(meta);
}

export default async function SharedRecordPage({
  params,
}: SharedRecordPageProps) {
  const { username, id } = await params;
  const { record, pairRecords } = await getSharedRecordPageData(username, id);

  if (!record) {
    notFound();
  }

  const mainRecord = sharedRecordToSakememRecord(record);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <SharedRecordAuthor
        username={record.profile_username}
        displayName={record.profile_display_name}
        avatarUrl={record.profile_avatar_url}
      />

      <SharedRecordContent
        mainRecord={mainRecord}
        pairRecords={pairRecords}
        date={record.date}
      />
    </div>
  );
}
