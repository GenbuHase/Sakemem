import { describe, expect, it } from "vitest";
import { groupRecordsForTimeline } from "./group-timeline";
import type { SakememRecord } from "@/lib/types/record";

function makeRecord(
  overrides: Partial<SakememRecord> & Pick<SakememRecord, "id" | "category" | "name">,
): SakememRecord {
  return {
    user_id: "user-1",
    pair_id: null,
    created_at: "2026-01-01T12:00:00Z",
    date: "2026-01-01",
    sub_info: null,
    rating: null,
    flavor_metrics: {},
    comment: null,
    ...overrides,
  };
}

describe("groupRecordsForTimeline", () => {
  it("groups paired records and keeps singles separate", () => {
    const entries = groupRecordsForTimeline([
      makeRecord({
        id: "drink-1",
        category: "beer",
        name: "エビス",
        pair_id: "pair-1",
      }),
      makeRecord({
        id: "food-1",
        category: "food",
        name: "枝豆",
        pair_id: "pair-1",
      }),
      makeRecord({
        id: "solo-1",
        category: "wine",
        name: "ボジョレー",
      }),
    ]);

    expect(entries).toHaveLength(2);
    expect(entries.some((entry) => entry.kind === "paired")).toBe(true);
    expect(entries.some((entry) => entry.kind === "single")).toBe(true);
  });

  it("groups one drink with multiple foods", () => {
    const entries = groupRecordsForTimeline([
      makeRecord({
        id: "drink-1",
        category: "beer",
        name: "エビス",
        pair_id: "pair-1",
      }),
      makeRecord({
        id: "food-1",
        category: "food",
        name: "枝豆",
        pair_id: "pair-1",
      }),
      makeRecord({
        id: "food-2",
        category: "food",
        name: "焼き鳥",
        pair_id: "pair-1",
      }),
    ]);

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      kind: "paired",
      drinks: [expect.objectContaining({ id: "drink-1" })],
      foods: [
        expect.objectContaining({ id: "food-1" }),
        expect.objectContaining({ id: "food-2" }),
      ],
    });
  });
});
