import { describe, expect, it } from "vitest";
import {
  filterLinkCandidates,
  getPartners,
  isOppositeRecordType,
} from "./pairing";
import type { SakememRecord } from "@/lib/types/record";

function createRecord(
  overrides: Partial<SakememRecord> & Pick<SakememRecord, "id" | "category" | "name">,
): SakememRecord {
  return {
    user_id: "user-1",
    pair_id: null,
    created_at: "2026-01-01T00:00:00.000Z",
    date: "2026-01-01",
    sub_info: null,
    rating: null,
    flavor_metrics: {},
    comment: null,
    ...overrides,
  };
}

describe("pairing helpers", () => {
  it("detects opposite record types", () => {
    const drink = createRecord({
      id: "drink-1",
      category: "beer",
      name: "IPA",
    });
    const food = createRecord({
      id: "food-1",
      category: "food",
      name: "枝豆",
    });

    expect(isOppositeRecordType(drink, food)).toBe(true);
    expect(isOppositeRecordType(drink, drink)).toBe(false);
  });

  it("returns partners with the same pair_id", () => {
    const drink = createRecord({
      id: "drink-1",
      category: "beer",
      name: "IPA",
      pair_id: "pair-1",
    });
    const food = createRecord({
      id: "food-1",
      category: "food",
      name: "枝豆",
      pair_id: "pair-1",
    });
    const single = createRecord({
      id: "food-2",
      category: "food",
      name: "チーズ",
    });

    expect(getPartners([drink, food, single], drink)).toEqual([food]);
  });

  it("filters unpaired opposite-type candidates", () => {
    const drink = createRecord({
      id: "drink-1",
      category: "beer",
      name: "IPA",
    });
    const food = createRecord({
      id: "food-1",
      category: "food",
      name: "枝豆",
    });
    const pairedFood = createRecord({
      id: "food-2",
      category: "food",
      name: "焼き鳥",
      pair_id: "pair-1",
    });
    const otherDrink = createRecord({
      id: "drink-2",
      category: "wine",
      name: "赤ワイン",
    });

    expect(
      filterLinkCandidates([food, pairedFood, otherDrink], drink),
    ).toEqual([food]);
  });
});
