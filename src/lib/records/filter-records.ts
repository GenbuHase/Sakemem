import { isFoodCategory } from "@/lib/constants/categories";
import { getDrinkStyleLabel } from "@/lib/constants/drink-styles";
import {
  RECORD_CATEGORIES,
  type RecordCategory,
  type SakememRecord,
} from "@/lib/types/record";

export type RecordKindFilter = "all" | "drink" | "food";

export type RecordFilters = {
  query?: string;
  category?: RecordCategory;
  kind?: RecordKindFilter;
};

export function parseRecordFilters(
  searchParams: Record<string, string | string[] | undefined>,
): RecordFilters {
  const rawQuery = searchParams.q;
  const rawCategory = searchParams.category;
  const rawKind = searchParams.kind;

  const query =
    typeof rawQuery === "string" ? rawQuery.trim() : undefined;

  const category =
    typeof rawCategory === "string" &&
    RECORD_CATEGORIES.includes(rawCategory as RecordCategory)
      ? (rawCategory as RecordCategory)
      : undefined;

  const kind: RecordKindFilter =
    rawKind === "drink" || rawKind === "food" ? rawKind : "all";

  return { query, category, kind };
}

export function hasActiveFilters(filters: RecordFilters): boolean {
  return Boolean(
    filters.query || filters.category || (filters.kind && filters.kind !== "all"),
  );
}

function matchesQuery(record: SakememRecord, query: string): boolean {
  const normalized = query.toLowerCase();
  const fields = [
    record.name,
    record.producer,
    getDrinkStyleLabel(record.category, record.style),
    record.sub_info,
    record.place,
    record.comment,
  ];

  return fields.some(
    (value) => value && value.toLowerCase().includes(normalized),
  );
}

export function filterRecords(
  records: SakememRecord[],
  filters: RecordFilters,
): SakememRecord[] {
  return records.filter((record) => {
    if (filters.query && !matchesQuery(record, filters.query)) {
      return false;
    }

    if (filters.category && record.category !== filters.category) {
      return false;
    }

    if (filters.kind === "drink" && isFoodCategory(record.category)) {
      return false;
    }

    if (filters.kind === "food" && !isFoodCategory(record.category)) {
      return false;
    }

    return true;
  });
}
