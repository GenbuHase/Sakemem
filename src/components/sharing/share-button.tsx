"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { buildRecordShareUrl } from "@/lib/sharing/build-share-url";
import {
  buildShareText,
  getPairFoodNames,
} from "@/lib/sharing/build-share-text";
import type { SakememRecord } from "@/lib/types/record";

type ShareButtonProps = {
  record: SakememRecord;
  username: string;
  pairRecords?: SakememRecord[];
};

export function ShareButton({
  record,
  username,
  pairRecords = [],
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = buildRecordShareUrl(username, record.id);
  const shareText = buildShareText({
    record,
    username,
    pairFoodNames: getPairFoodNames(pairRecords),
  });

  async function copyUrl() {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareOnX() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function nativeShare() {
    if (!navigator.share) return;
    await navigator.share({
      title: record.name,
      text: shareText,
      url: shareUrl,
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="secondary" size="sm" onClick={copyUrl}>
        {copied ? "コピーしました" : "共有文をコピー"}
      </Button>
      <Button type="button" variant="secondary" size="sm" onClick={shareOnX}>
        X で投稿
      </Button>
      {typeof navigator !== "undefined" && "share" in navigator ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => void nativeShare()}
        >
          共有…
        </Button>
      ) : null}
    </div>
  );
}
