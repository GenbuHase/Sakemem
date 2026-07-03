"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";
import {
  dismissAnnouncement,
  getDismissedAnnouncementIds,
  subscribeDismissedAnnouncements,
} from "@/lib/announcements/dismiss-storage";
import type { Announcement } from "@/lib/announcements/types";
import { cx } from "@/components/ui/styles";

type UpdateAnnouncementBannerProps = {
  announcement: Announcement;
};

export function UpdateAnnouncementBanner({
  announcement,
}: UpdateAnnouncementBannerProps) {
  const getSnapshot = useCallback(
    () => getDismissedAnnouncementIds().includes(announcement.id),
    [announcement.id],
  );
  const isDismissed = useSyncExternalStore(
    subscribeDismissedAnnouncements,
    getSnapshot,
    () => false,
  );

  if (isDismissed) {
    return null;
  }

  function handleDismiss() {
    dismissAnnouncement(announcement.id);
  }

  return (
    <div
      role="status"
      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <div className="flex items-start gap-3">
        <MegaphoneIcon className="mt-0.5 shrink-0 text-amber-600" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">{announcement.title}</p>
          <p className="mt-1 leading-relaxed text-amber-900/90">
            {announcement.body}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link
              href="/changelog"
              className="font-medium text-amber-800 underline-offset-2 hover:underline"
            >
              すべて見る
            </Link>
            {announcement.link ? (
              <Link
                href={announcement.link.href}
                className="font-medium text-amber-800 underline-offset-2 hover:underline"
              >
                {announcement.link.label}
              </Link>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className={cx(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            "text-amber-700 transition hover:bg-amber-100/80",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300",
          )}
          aria-label="お知らせを閉じる"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

function MegaphoneIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4 10v4m0-4 9-4.5V18.5L4 14m9-9 5.5 2.25a2 2 0 0 1 0 3.5L13 9M4 10h2.5a2.5 2.5 0 0 1 0 5H4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m5 5 10 10M15 5 5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
