import type { SakememRecord } from "@/lib/types/record";

export function sortCachedRecords(
  records: SakememRecord[],
): SakememRecord[] {
  return records.toSorted(
    (a, b) =>
      b.date.localeCompare(a.date) ||
      b.created_at.localeCompare(a.created_at),
  );
}

export function upsertCachedRecords(
  current: SakememRecord[],
  changed: SakememRecord[],
): SakememRecord[] {
  const byId = new Map(current.map((record) => [record.id, record]));
  changed.forEach((record) => byId.set(record.id, record));
  return sortCachedRecords(Array.from(byId.values()));
}

export function removeCachedRecords(
  current: SakememRecord[],
  ids: string[],
): SakememRecord[] {
  const idSet = new Set(ids);
  return current.filter((record) => !idSet.has(record.id));
}
