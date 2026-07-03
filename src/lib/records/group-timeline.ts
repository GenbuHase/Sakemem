import { isFoodCategory } from "@/lib/constants/categories";
import type { SakememRecord } from "@/lib/types/record";

export type TimelineEntry =
  | {
      kind: "single";
      date: string;
      createdAt: string;
      record: SakememRecord;
    }
  | {
      kind: "paired";
      pairId: string;
      date: string;
      createdAt: string;
      drinks: SakememRecord[];
      foods: SakememRecord[];
    };

function getSortKey(date: string, createdAt: string): string {
  return `${date}T${createdAt}`;
}

export function groupRecordsForTimeline(
  records: SakememRecord[],
): TimelineEntry[] {
  const paired = new Map<string, SakememRecord[]>();
  const singles: SakememRecord[] = [];

  for (const record of records) {
    if (record.pair_id) {
      const group = paired.get(record.pair_id) ?? [];
      group.push(record);
      paired.set(record.pair_id, group);
    } else {
      singles.push(record);
    }
  }

  const entries: TimelineEntry[] = [];

  for (const [pairId, group] of paired) {
    const drinks = group.filter((record) => !isFoodCategory(record.category));
    const foods = group.filter((record) => isFoodCategory(record.category));
    const latest = group.reduce((current, record) =>
      getSortKey(record.date, record.created_at) >
      getSortKey(current.date, current.created_at)
        ? record
        : current,
    );

    entries.push({
      kind: "paired",
      pairId,
      date: latest.date,
      createdAt: latest.created_at,
      drinks,
      foods,
    });
  }

  for (const record of singles) {
    entries.push({
      kind: "single",
      date: record.date,
      createdAt: record.created_at,
      record,
    });
  }

  return entries.sort(
    (a, b) =>
      getSortKey(b.date, b.createdAt).localeCompare(
        getSortKey(a.date, a.createdAt),
      ),
  );
}

export type TimelineDateGroup = {
  date: string;
  entries: TimelineEntry[];
};

export function groupTimelineEntriesByDate(
  entries: TimelineEntry[],
): TimelineDateGroup[] {
  const byDate = new Map<string, TimelineEntry[]>();

  for (const entry of entries) {
    const group = byDate.get(entry.date) ?? [];
    group.push(entry);
    byDate.set(entry.date, group);
  }

  const groups: TimelineDateGroup[] = [];
  const seenDates = new Set<string>();

  for (const entry of entries) {
    if (seenDates.has(entry.date)) {
      continue;
    }

    seenDates.add(entry.date);
    groups.push({
      date: entry.date,
      entries: byDate.get(entry.date) ?? [],
    });
  }

  return groups;
}
