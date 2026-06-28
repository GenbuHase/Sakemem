import { describe, expect, it } from "vitest";
import { analyzeRecords } from "./analyze-records";
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

describe("analyzeRecords", () => {
  it("summarizes counts and category stats", () => {
    const records: SakememRecord[] = [
      makeRecord({
        id: "1",
        category: "japanese-sake",
        name: "獺祭",
        rating: 5,
        pair_id: "pair-1",
      }),
      makeRecord({
        id: "2",
        category: "food",
        name: "枝豆",
        rating: 4,
        pair_id: "pair-1",
      }),
      makeRecord({
        id: "3",
        category: "beer",
        name: "エビス",
        rating: 3,
      }),
    ];

    const analysis = analyzeRecords(records);

    expect(analysis.total).toBe(3);
    expect(analysis.drinkCount).toBe(2);
    expect(analysis.foodCount).toBe(1);
    expect(analysis.pairedSessionCount).toBe(1);
    expect(analysis.categoryStats).toHaveLength(3);
  });
});
