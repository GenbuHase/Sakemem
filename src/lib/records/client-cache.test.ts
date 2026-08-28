import { describe, expect, it } from "vitest";
import type { SakememRecord } from "@/lib/types/record";
import {
  removeCachedRecords,
  sortCachedRecords,
  upsertCachedRecords,
} from "./client-cache";

function makeRecord(
  id: string,
  overrides: Partial<SakememRecord> = {},
): SakememRecord {
  return {
    id,
    user_id: "user-1",
    pair_id: null,
    created_at: "2026-01-01T12:00:00Z",
    date: "2026-01-01",
    category: "beer",
    name: id,
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

describe("client record cache", () => {
  it("keeps records newest-first", () => {
    const older = makeRecord("older");
    const newer = makeRecord("newer", { date: "2026-01-02" });

    expect(sortCachedRecords([older, newer]).map(({ id }) => id)).toEqual([
      "newer",
      "older",
    ]);
  });

  it("uses the ID as a stable ordering tie-breaker", () => {
    const first = makeRecord("00000000-0000-0000-0000-000000000001");
    const second = makeRecord("00000000-0000-0000-0000-000000000002");

    expect(sortCachedRecords([first, second]).map(({ id }) => id)).toEqual([
      second.id,
      first.id,
    ]);
  });

  it("applies create and update results without duplicating records", () => {
    const original = makeRecord("record-1", { name: "更新前" });
    const updated = makeRecord("record-1", { name: "更新後" });
    const created = makeRecord("record-2", { date: "2026-01-02" });

    const next = upsertCachedRecords([original], [updated, created]);

    expect(next).toHaveLength(2);
    expect(next.find(({ id }) => id === "record-1")?.name).toBe("更新後");
    expect(next[0].id).toBe("record-2");
  });

  it("removes optimistic deletion targets", () => {
    const next = removeCachedRecords(
      [makeRecord("record-1"), makeRecord("record-2")],
      ["record-1"],
    );

    expect(next.map(({ id }) => id)).toEqual(["record-2"]);
  });
});
