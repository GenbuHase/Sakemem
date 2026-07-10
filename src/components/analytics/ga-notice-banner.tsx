"use client";

import { useSyncExternalStore } from "react";
import {
  dismissGaNotice,
  isGaNoticeDismissed,
  subscribeGaNotice,
} from "@/lib/analytics/ga-notice-storage";
import { Button } from "@/components/ui/button";
import { cx } from "@/components/ui/styles";

type GaNoticeBannerProps = {
  enabled: boolean;
};

export function GaNoticeBanner({ enabled }: GaNoticeBannerProps) {
  const isDismissed = useSyncExternalStore(
    subscribeGaNotice,
    isGaNoticeDismissed,
    () => true,
  );

  if (!enabled || isDismissed) {
    return null;
  }

  return (
    <div
      role="status"
      className={cx(
        "fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(24,24,27,0.06)] backdrop-blur-sm",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
      )}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm leading-relaxed text-zinc-700">
          本サイトでは、利用状況の把握とサービス改善のため{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-zinc-900 underline-offset-2 hover:underline"
          >
            Google Analytics
          </a>{" "}
          を使用しています。
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0 self-end sm:self-auto"
          onClick={dismissGaNotice}
        >
          閉じる
        </Button>
      </div>
    </div>
  );
}
