import { describe, expect, it } from "vitest";
import { OG_ELLIPSIS, sanitizeOgText, truncateOgText } from "./og-image-utils";

describe("sanitizeOgText", () => {
  it("keeps Japanese and Latin text", () => {
    expect(sanitizeOgText("晩酌メモ @SU_Mentsuyu")).toBe(
      "晩酌メモ @SU_Mentsuyu",
    );
  });

  it("removes box-drawing and arrow symbols that break OG font loading", () => {
    expect(sanitizeOgText("⇢┊装飾テキスト")).toBe("装飾テキスト");
  });

  it("removes supplementary-plane characters such as emoji", () => {
    expect(sanitizeOgText("乾杯🍶")).toBe("乾杯");
  });
});

describe("truncateOgText", () => {
  it("returns sanitized text when within the limit", () => {
    expect(truncateOgText("短い自己紹介", 80)).toBe("短い自己紹介");
  });

  it("appends ellipsis when text exceeds the limit", () => {
    const longBio = "あ".repeat(100);
    expect(truncateOgText(longBio, 80)).toBe(
      `${"あ".repeat(78)}${OG_ELLIPSIS}`,
    );
  });

  it("sanitizes before truncating", () => {
    const text = `${"あ".repeat(79)}🍶`;
    expect(truncateOgText(text, 80)).toBe(`${"あ".repeat(79)}`);
  });
});
