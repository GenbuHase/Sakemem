import { describe, expect, it } from "vitest";
import {
  filterRecords,
  hasActiveFilters,
  parseRecordFilters,
} from "./filter-records";
import type { SakememRecord } from "@/lib/types/record";

function makeRecord(
  overrides: Partial<SakememRecord> & Pick<SakememRecord, "id" | "category" | "name">,
): SakememRecord {
  return {
    user_id: "user-1",
    pair_id: null,
    created_at: "2026-01-01T12:00:00Z",
    date: "2026-01-01",
    producer: null,
    style: null,
    sub_info: null,
    place: null,
    rating: null,
    flavor_metrics: {},
    comment: null,
    visibility: "private",
    hide_place_when_shared: false,
    ...overrides,
  };
}

const records: SakememRecord[] = [
  makeRecord({
    id: "1",
    category: "japanese-sake",
    name: "獺祭",
    producer: "旭酒造",
    pair_id: "pair-1",
  }),
  makeRecord({
    id: "2",
    category: "food",
    name: "枝豆",
    pair_id: "pair-1",
  }),
  makeRecord({
    id: "3",
    category: "beer",
    name: "エビス",
    comment: "定番の一杯",
  }),
];

describe("parseRecordFilters", () => {
  it("parses query, category, and kind from search params", () => {
    expect(
      parseRecordFilters({
        q: " 獺祭 ",
        category: "japanese-sake",
        kind: "drink",
      }),
    ).toEqual({
      query: "獺祭",
      category: "japanese-sake",
      kind: "drink",
    });
  });

  it("ignores invalid category values", () => {
    expect(parseRecordFilters({ category: "invalid" })).toEqual({
      query: undefined,
      category: undefined,
      kind: "all",
    });
  });
});

describe("hasActiveFilters", () => {
  it("returns true when any filter is set", () => {
    expect(hasActiveFilters({ query: "枝豆" })).toBe(true);
    expect(hasActiveFilters({ category: "food" })).toBe(true);
    expect(hasActiveFilters({ kind: "drink" })).toBe(true);
    expect(hasActiveFilters({ kind: "all" })).toBe(false);
  });
});

describe("filterRecords", () => {
  it("filters by keyword across name, producer, sub_info, place, and comment", () => {
    expect(filterRecords(records, { query: "旭酒造" })).toHaveLength(1);
    expect(filterRecords(records, { query: "定番" })).toHaveLength(1);
  });

  it("filters by category and kind", () => {
    expect(filterRecords(records, { category: "food" })).toHaveLength(1);
    expect(filterRecords(records, { kind: "drink" })).toHaveLength(2);
    expect(filterRecords(records, { kind: "food" })).toHaveLength(1);
  });
});
