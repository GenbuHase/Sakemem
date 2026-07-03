import { describe, expect, it } from "vitest";
import { rewriteAtUsernameToProfilePath } from "./public-profile-path";

describe("rewriteAtUsernameToProfilePath", () => {
  it("rewrites profile root", () => {
    expect(rewriteAtUsernameToProfilePath("/@genbu")).toBe("/profile/genbu");
  });

  it("rewrites shared record page", () => {
    expect(rewriteAtUsernameToProfilePath("/@genbu/abc-123")).toBe(
      "/profile/genbu/abc-123",
    );
  });

  it("rewrites opengraph-image for profile", () => {
    expect(rewriteAtUsernameToProfilePath("/@genbu/opengraph-image")).toBe(
      "/profile/genbu/opengraph-image",
    );
  });

  it("rewrites opengraph-image for shared record", () => {
    expect(
      rewriteAtUsernameToProfilePath("/@genbu/abc-123/opengraph-image"),
    ).toBe("/profile/genbu/abc-123/opengraph-image");
  });

  it("returns null for non-@ paths", () => {
    expect(rewriteAtUsernameToProfilePath("/profile/genbu")).toBeNull();
    expect(rewriteAtUsernameToProfilePath("/records")).toBeNull();
  });
});
