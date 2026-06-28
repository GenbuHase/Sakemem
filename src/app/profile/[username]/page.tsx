import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProfileAvatar } from "@/components/profiles/profile-avatar";
import { Timeline } from "@/components/records/timeline";
import { buildPageMetadata } from "@/lib/metadata/build-metadata";
import { buildPublicProfileMetadataInput } from "@/lib/metadata/public-profile";
import { siteName } from "@/lib/metadata/site";
import { createPublicClient } from "@/lib/supabase/public";
import {
  fetchPublicProfile,
  fetchPublicProfileRecords,
} from "@/lib/sharing/fetch-shared";
import { groupRecordsForTimeline } from "@/lib/records/group-timeline";

type PublicProfilePageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { username } = await params;

  try {
    const supabase = createPublicClient();
    const profile = await fetchPublicProfile(supabase, username);

    if (!profile) {
      return {
        title: "プロフィールが見つかりません",
        robots: { index: false, follow: false },
      };
    }

    const records = await fetchPublicProfileRecords(supabase, username);
    const meta = buildPublicProfileMetadataInput(profile, records.length);
    return buildPageMetadata(meta);
  } catch {
    return {
      title: `@${username} | ${siteName}`,
      robots: { index: false, follow: false },
    };
  }
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { username } = await params;
  const supabase = createPublicClient();
  const profile = await fetchPublicProfile(supabase, username);

  if (!profile) {
    notFound();
  }

  const records = await fetchPublicProfileRecords(supabase, username);
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
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
          <p className="text-sm text-zinc-600">
            まだ公開されている記録はありません
          </p>
        </div>
      ) : (
        <Timeline entries={entries} showActions={false} />
      )}

      <p className="mt-8 text-center text-xs text-zinc-400">
        <Link href="/" className="hover:text-zinc-600">
          Sakemem で晩酌を記録する
        </Link>
      </p>
    </div>
  );
}
