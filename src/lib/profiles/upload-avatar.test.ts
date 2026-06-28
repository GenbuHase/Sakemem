import { describe, expect, it } from "vitest";
import { validateAvatarFile } from "./upload-avatar";

describe("validateAvatarFile", () => {
  it("accepts valid image files", () => {
    const file = new File(["x"], "avatar.png", { type: "image/png" });
    Object.defineProperty(file, "size", { value: 1024 });
    expect(validateAvatarFile(file)).toEqual({ ok: true });
  });

  it("rejects oversized files", () => {
    const file = new File(["x"], "avatar.png", { type: "image/png" });
    Object.defineProperty(file, "size", { value: 3 * 1024 * 1024 });
    expect(validateAvatarFile(file).ok).toBe(false);
  });

  it("rejects invalid mime types", () => {
    const file = new File(["x"], "avatar.gif", { type: "image/gif" });
    Object.defineProperty(file, "size", { value: 1024 });
    expect(validateAvatarFile(file).ok).toBe(false);
  });
});
