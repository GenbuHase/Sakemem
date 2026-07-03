import { describe, expect, it } from "vitest";
import { splitDrinksAndFoods } from "./split-pair";
import type { SakememRecord } from "@/lib/types/record";

function makeRecord(
  overrides: Partial<SakememRecord> & Pick<SakememRecord, "category" | "name">,
): SakememRecord {
  return {
    id: "id-1",
    user_id: "user-1",
    pair_id: null,
    created_at: "2026-01-01T00:00:00Z",
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

describe("splitDrinksAndFoods", () => {
  it("splits drinks and foods", () => {
    const drink = makeRecord({ category: "beer", name: "IPA" });
    const food = makeRecord({ id: "id-2", category: "food", name: "枝豆" });

    const result = splitDrinksAndFoods([drink, food]);

    expect(result.drinks).toEqual([drink]);
    expect(result.foods).toEqual([food]);
    expect(result.isPaired).toBe(true);
  });

  it("returns isPaired false for single type", () => {
    const drink = makeRecord({ category: "wine", name: "赤" });

    const result = splitDrinksAndFoods([drink]);

    expect(result.drinks).toEqual([drink]);
    expect(result.foods).toEqual([]);
    expect(result.isPaired).toBe(false);
  });
});
