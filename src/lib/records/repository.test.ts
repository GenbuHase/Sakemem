import { describe, expect, it } from "vitest";
import {
  getRecordsCursor,
  serializeRecordsCursor,
} from "./repository";
import type { SakememRecord } from "@/lib/types/record";

const record = {
  id: "00000000-0000-0000-0000-000000000001",
  date: "2026-08-28",
  created_at: "2026-08-28T12:00:00.000Z",
} as SakememRecord;

describe("records pagination cursor", () => {
  it("contains every stable ordering key", () => {
    expect(getRecordsCursor(record)).toEqual({
      id: record.id,
      date: record.date,
      created_at: record.created_at,
    });
  });

  it("serializes cursor fields without losing their order", () => {
    expect(serializeRecordsCursor(getRecordsCursor(record))).toBe(
      "2026-08-28|2026-08-28T12:00:00.000Z|00000000-0000-0000-0000-000000000001",
    );
  });
});
