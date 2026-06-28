import { isFoodCategory } from "@/lib/constants/categories";
import type { SakememRecord } from "@/lib/types/record";
import { buildRecordShareUrl } from "./build-share-url";

type ShareTextInput = {
  record: SakememRecord;
  username: string;
  pairFoodNames?: string[];
};

export function buildShareText({
  record,
  username,
  pairFoodNames = [],
}: ShareTextInput): string {
  const lines: string[] = ["今夜の一杯 🍶"];

  const producerPart = record.producer ? `（${record.producer}）` : "";
  const ratingPart =
    record.rating !== null ? `★${record.rating}` : "評価なし";
  lines.push(`${record.name}${producerPart}${ratingPart}`);

  if (pairFoodNames.length > 0) {
    lines.push(`合わせて: ${pairFoodNames.join("、")}`);
  }

  lines.push(buildRecordShareUrl(username, record.id));
  lines.push("#Sakemem");

  return lines.join("\n");
}

export function getPairFoodNames(records: SakememRecord[]): string[] {
  return records
    .filter((record) => isFoodCategory(record.category))
    .map((record) => record.name);
}
