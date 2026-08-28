import { describe, expect, it } from "vitest";
import { isUuid } from "./is-uuid";

describe("isUuid", () => {
  it("accepts canonical UUID values", () => {
    expect(isUuid("eb26bde1-fe4c-412b-a9cd-80b6a30c3e11")).toBe(true);
    expect(isUuid("EB26BDE1-FE4C-412B-A9CD-80B6A30C3E11")).toBe(true);
  });

  it("rejects malformed values", () => {
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid("eb26bde1fe4c412ba9cd80b6a30c3e11")).toBe(false);
  });
});
