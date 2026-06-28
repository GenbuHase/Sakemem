import { describe, expect, it } from "vitest";
import {
  isOwnedProfileImagePath,
  parseProfileImageObjectPath,
} from "./delete-avatar-storage";

describe("parseProfileImageObjectPath", () => {
  it("extracts object path from a public storage URL", () => {
    const url =
      "https://example.supabase.co/storage/v1/object/public/profile-images/user-id/abc.webp";
    expect(parseProfileImageObjectPath(url)).toBe("user-id/abc.webp");
  });

  it("returns null for unrelated URLs", () => {
    expect(parseProfileImageObjectPath("https://example.com/avatar.png")).toBeNull();
  });
});

describe("isOwnedProfileImagePath", () => {
  it("accepts paths under the user folder", () => {
    expect(isOwnedProfileImagePath("user-id", "user-id/abc.webp")).toBe(true);
  });

  it("rejects paths owned by another user", () => {
    expect(isOwnedProfileImagePath("user-id", "other-user/abc.webp")).toBe(false);
  });
});
