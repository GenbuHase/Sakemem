import { describe, expect, it } from "vitest";
import {
  announcements,
  formatAnnouncementDate,
  getLatestAnnouncement,
} from "./changelog";

describe("changelog", () => {
  it("returns the first entry as the latest announcement", () => {
    expect(getLatestAnnouncement()).toEqual(announcements[0]);
  });

  it("formats announcement dates in Japanese", () => {
    expect(formatAnnouncementDate("2026-07-04")).toBe("2026年7月4日");
  });

  it("keeps unique announcement ids", () => {
    const ids = announcements.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
