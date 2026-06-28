import type { SharedRecord } from "@/lib/sharing/mask-record";
import { getPairFoodNames } from "@/lib/sharing/build-share-text";
import type { SakememRecord } from "@/lib/types/record";
import { buildRecordOgImagePath } from "./og-image-path";
import { siteName } from "./site";

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export function buildRecordShareTitle(record: Pick<SakememRecord, "name" | "rating">): string {
  const rating =
    record.rating !== null ? `★${record.rating}` : "—";
  return `${record.name} ${rating} | ${siteName}`;
}

export function buildRecordShareDescription(
  record: Pick<SakememRecord, "producer" | "comment">,
  pairRecords: SakememRecord[] = [],
): string {
  const parts: string[] = [];

  if (record.producer) {
    parts.push(record.producer);
  }

  const foodNames = getPairFoodNames(pairRecords);
  if (foodNames.length > 0) {
    parts.push(`合わせて: ${foodNames.join("、")}`);
  }

  if (record.comment) {
    parts.push(record.comment);
  }

  return truncate(parts.join(" · ") || "晩酌の記録", 120);
}

export function buildRecordShareMetadataInput(
  record: SharedRecord,
  pairRecords: SakememRecord[] = [],
) {
  const sakemem = {
    name: record.name,
    rating: record.rating,
    producer: record.producer,
    comment: record.comment,
  };

  return {
    title: buildRecordShareTitle(sakemem),
    description: buildRecordShareDescription(sakemem, pairRecords),
    path: `/@${record.profile_username}/${record.id}`,
    imagePath: buildRecordOgImagePath(record.profile_username, record.id),
    robots:
      record.visibility === "public"
        ? ({ index: true, follow: true } as const)
        : ({ index: false, follow: false } as const),
  };
}
