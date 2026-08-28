"use client";

import dynamic from "next/dynamic";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { UpdateAnnouncementBanner } from "@/components/announcements/update-announcement-banner";
import { useProfile } from "@/components/providers/auth-provider";
import { useRecords } from "@/components/providers/records-provider";
import { TimelineContainer } from "@/components/records/timeline-container";
import { LinkButton } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { getLatestAnnouncement } from "@/lib/announcements/changelog";
import { parseRecordFilters } from "@/lib/records/filter-records";

const EditRecordPageContent = dynamic(
  () =>
    import("@/components/records/edit-record-page-content").then(
      (module) => module.EditRecordPageContent,
    ),
  { loading: EditRecordLoading },
);

export function RecordsPageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { profile } = useProfile();
  const {
    status,
    records,
    error,
    hasMore,
    loadingMore,
    loadMoreRecords,
    loadRecords,
  } = useRecords();
  const initialFilters = useMemo(
    () => parseRecordFilters(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );
  const latestAnnouncement = getLatestAnnouncement();
  const editRecordId = getEditRecordId(pathname);

  useEffect(() => {
    void loadRecords().catch(() => undefined);
  }, [loadRecords]);

  useEffect(() => {
    document.title = editRecordId
      ? "記録を編集 | Sakemem"
      : "タイムライン | Sakemem";
  }, [editRecordId]);

  if (editRecordId) {
    return <EditRecordPageContent recordId={editRecordId} />;
  }

  if (status === "idle" || status === "loading") {
    return <RecordsPageSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="タイムライン"
        description="過去の晩酌記録を振り返れます。"
        action={<LinkButton href="/records/new">記録する</LinkButton>}
      />

      {latestAnnouncement ? (
        <div className="mb-6">
          <UpdateAnnouncementBanner announcement={latestAnnouncement} />
        </div>
      ) : null}

      {status === "error" ? (
        <div className="space-y-3">
          <FormMessage variant="error">
            {error ?? "記録の取得に失敗しました。"}
          </FormMessage>
          <button
            type="button"
            className="text-sm font-medium text-zinc-700 underline"
            onClick={() => void loadRecords({ force: true })}
          >
            再試行する
          </button>
        </div>
      ) : (
        <TimelineContainer
          allRecords={records}
          initialFilters={initialFilters}
          shareUsername={profile?.username ?? null}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={() => void loadMoreRecords().catch(() => undefined)}
        />
      )}
    </div>
  );
}

function EditRecordLoading() {
  return (
    <div
      className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10"
      aria-busy="true"
      aria-label="記録を読み込んでいます"
    >
      <div className="h-96 animate-pulse rounded-xl bg-zinc-100" />
    </div>
  );
}

function getEditRecordId(pathname: string): string | null {
  const match = /^\/records\/([^/]+)\/edit$/.exec(pathname);
  if (!match) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export function RecordsPageSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10"
      aria-busy="true"
      aria-label="タイムラインを読み込んでいます"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded bg-zinc-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-zinc-100" />
        </div>
        <div className="h-10 w-24 animate-pulse rounded bg-zinc-200" />
      </div>
      <div className="space-y-4">
        <div className="h-28 animate-pulse rounded-xl bg-zinc-100" />
        <div className="h-40 animate-pulse rounded-xl bg-zinc-100" />
        <div className="h-52 animate-pulse rounded-xl bg-zinc-100" />
      </div>
    </div>
  );
}
