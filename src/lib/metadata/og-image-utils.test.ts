import { describe, expect, it } from "vitest";
import { sanitizeOgText } from "./og-image-utils";

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
