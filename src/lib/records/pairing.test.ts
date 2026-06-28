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

  it("returns all partners in a multi-item pair", () => {
    const drink = createRecord({
      id: "drink-1",
      category: "beer",
      name: "IPA",
      pair_id: "pair-1",
    });
    const food1 = createRecord({
      id: "food-1",
      category: "food",
      name: "枝豆",
      pair_id: "pair-1",
    });
    const food2 = createRecord({
      id: "food-2",
      category: "food",
      name: "焼き鳥",
      pair_id: "pair-1",
    });

    expect(getPartners([drink, food1, food2], drink)).toEqual([food1, food2]);
  });

  it("returns unpaired and other-pair candidates when current record is paired", () => {
    const drink = createRecord({
      id: "drink-1",
      category: "beer",
      name: "IPA",
      pair_id: "pair-1",
    });
    const pairedFood = createRecord({
      id: "food-1",
      category: "food",
      name: "枝豆",
      pair_id: "pair-1",
    });
    const unpairedFood = createRecord({
      id: "food-2",
      category: "food",
      name: "チーズ",
    });
    const otherPairedFood = createRecord({
      id: "food-3",
      category: "food",
      name: "焼き鳥",
      pair_id: "pair-2",
    });

    expect(
      filterLinkCandidates(
        [pairedFood, unpairedFood, otherPairedFood],
        drink,
      ),
    ).toEqual([unpairedFood, otherPairedFood]);
  });

  it("filters opposite-type candidates and excludes current partners", () => {
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
    ).toEqual([food, pairedFood]);
  });
});
