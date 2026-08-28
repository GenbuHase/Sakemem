import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProfileAvatar } from "@/components/profiles/profile-avatar";
import { Timeline } from "@/components/records/timeline";
import { EmptyState } from "@/components/ui/empty-state";
import { buildPageMetadata } from "@/lib/metadata/build-metadata";
import { buildPublicProfileMetadataInput } from "@/lib/metadata/public-profile";
import { getPublicProfilePageData } from "@/lib/sharing/public-data";
import { groupRecordsForTimeline } from "@/lib/records/group-timeline";

type PublicProfilePageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PublicProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const { page } = await searchParams;
  const currentPage = parsePage(page);
  const { profile, totalRecords } = await getPublicProfilePageData(
    username,
    currentPage,
  );

  if (!profile) {
    return { title: "プロフィールが見つかりません" };
  }

  const meta = buildPublicProfileMetadataInput(profile, totalRecords);
  return {
    ...buildPageMetadata(meta),
    robots:
      currentPage === 1
        ? { index: true, follow: true }
        : { index: false, follow: true },
  };
}

export default async function PublicProfilePage({
  params,
  searchParams,
}: PublicProfilePageProps) {
  const { username } = await params;
  const { page } = await searchParams;
  const currentPage = parsePage(page);
  const { profile, records, totalRecords, hasMore } =
    await getPublicProfilePageData(username, currentPage);

  if (!profile) {
    notFound();
  }

  const entries = groupRecordsForTimeline(records);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start">
        <ProfileAvatar
          displayName={profile.display_name}
          avatarUrl={profile.avatar_url}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-zinc-900">
            {profile.display_name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">@{profile.username}</p>
          {profile.bio ? (
            <p className="mt-3 text-sm leading-relaxed text-zinc-700">
              {profile.bio}
            </p>
          ) : null}
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyState variant="public-profile-empty" />
      ) : (
        <>
          <Timeline entries={entries} showActions={false} />
          {hasMore ? (
            <div className="mt-8 flex justify-center">
              <Link
                href={`/@${encodeURIComponent(profile.username)}?page=${currentPage + 1}`}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                さらに読み込む（{records.length} / {totalRecords}件）
              </Link>
            </div>
          ) : (
            <p className="mt-8 text-center text-sm text-zinc-500">
              全{totalRecords}件を表示しました
            </p>
          )}
        </>
      )}

      <p className="mt-8 text-center text-xs text-zinc-400">
        <Link href="/" className="hover:text-zinc-600">
          Sakemem で晩酌を記録する
        </Link>
      </p>
    </div>
  );
}

function parsePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
