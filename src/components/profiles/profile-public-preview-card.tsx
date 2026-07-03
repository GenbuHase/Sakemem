"use client";

import { LinkButton } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { buildProfileUrl } from "@/lib/sharing/build-share-url";
import { useCopyFeedback } from "@/lib/utils/use-copy-feedback";

type ProfilePublicPreviewCardProps = {
  liveUsername: string;
  draftUsername?: string;
  showSavedNotice?: boolean;
};

export function ProfilePublicPreviewCard({
  liveUsername,
  draftUsername,
  showSavedNotice = false,
}: ProfilePublicPreviewCardProps) {
  const { copied, copy } = useCopyFeedback();
  const liveUrl = buildProfileUrl(liveUsername);
  const trimmedDraft = draftUsername?.trim() ?? "";
  const hasPendingUsername =
    trimmedDraft.length > 0 && trimmedDraft !== liveUsername;
  const pendingUrl = hasPendingUsername
    ? buildProfileUrl(trimmedDraft)
    : null;

  return (
    <SectionCard
      title="公開プロフィール"
      description="他人から見えるページです。保存した内容がそのまま表示されます。"
    >
      <div className="space-y-3">
        {showSavedNotice ? (
          <p
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
          >
            公開 URL を更新しました
          </p>
        ) : null}

        <div>
          <p className="mb-1.5 text-xs font-medium text-zinc-500">
            {hasPendingUsername ? "現在の公開 URL" : "公開 URL"}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <p className="min-w-0 flex-1 truncate rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-800">
              {liveUrl}
            </p>
            <button
              type="button"
              onClick={() => void copy(liveUrl)}
              className="shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
            >
              {copied ? "コピーしました" : "URL をコピー"}
            </button>
          </div>
        </div>

        {pendingUrl ? (
          <div>
            <p className="mb-1.5 text-xs font-medium text-zinc-500">
              保存後の公開 URL
            </p>
            <p className="truncate rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50 px-3 py-2 font-mono text-sm text-zinc-600">
              {pendingUrl}
            </p>
          </div>
        ) : null}

        <div className="pt-1">
          <LinkButton
            href={`/@${liveUsername}`}
            variant="secondary"
            size="sm"
          >
            公開プロフィールを見る
          </LinkButton>
        </div>
      </div>
    </SectionCard>
  );
}
