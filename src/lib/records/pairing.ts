import { isFoodCategory } from "@/lib/constants/categories";
import type { SakememRecord } from "@/lib/types/record";

export function isOppositeRecordType(
  a: SakememRecord,
  b: SakememRecord,
): boolean {
  return isFoodCategory(a.category) !== isFoodCategory(b.category);
}

export function filterLinkCandidates(
  records: SakememRecord[],
  current: SakememRecord,
): SakememRecord[] {
  const currentIsFood = isFoodCategory(current.category);

  return records.filter(
    (record) =>
      record.id !== current.id &&
      record.pair_id === null &&
      isFoodCategory(record.category) !== currentIsFood,
  );
}

export function getPartners(
  records: SakememRecord[],
  record: SakememRecord,
): SakememRecord[] {
  if (!record.pair_id) {
    return [];
  }

  return records.filter(
    (candidate) =>
      candidate.pair_id === record.pair_id && candidate.id !== record.id,
  );
}
