import { describe, expect, it } from "vitest";
import {
  OG_BIO_MAX_LENGTH,
  OG_ELLIPSIS,
  sanitizeOgText,
  splitOgBioLineSegments,
  splitOgBioLines,
  truncateOgText,
} from "./og-image-utils";

describe("sanitizeOgText", () => {
  it("keeps Japanese and Latin text", () => {
    expect(sanitizeOgText("晩酌メモ @SU_Mentsuyu")).toBe(
      "晩酌メモ @SU_Mentsuyu",
    );
  });

  it("keeps box-drawing and arrow symbols", () => {
    expect(sanitizeOgText("⇢┊装飾テキスト")).toBe("⇢┊装飾テキスト");
  });

  it("keeps supplementary-plane characters such as emoji", () => {
    expect(sanitizeOgText("乾杯🍶")).toBe("乾杯🍶");
  });
});

describe("truncateOgText", () => {
  it("returns sanitized text when within the limit", () => {
    expect(truncateOgText("短い自己紹介", OG_BIO_MAX_LENGTH)).toBe(
      "短い自己紹介",
    );
  });

  it("appends ellipsis when text exceeds the limit", () => {
    const longBio = "あ".repeat(OG_BIO_MAX_LENGTH + 20);
    expect(truncateOgText(longBio, OG_BIO_MAX_LENGTH)).toBe(
      `${"あ".repeat(OG_BIO_MAX_LENGTH - OG_ELLIPSIS.length)}${OG_ELLIPSIS}`,
    );
  });

  it("truncates emoji like other characters", () => {
    const text = `${"あ".repeat(OG_BIO_MAX_LENGTH - 1)}🍶`;
    expect(truncateOgText(text, OG_BIO_MAX_LENGTH)).toBe(
      `${"あ".repeat(OG_BIO_MAX_LENGTH - OG_ELLIPSIS.length)}${OG_ELLIPSIS}`,
    );
  });
});

describe("splitOgBioLines", () => {
  it("preserves explicit line breaks", () => {
    const bio = [
      "TSU20C(心理) → Saitama Univ. '21PS(教育特支) → Web Engineer '25",
      "┆小学1種・中高1種(英語)・特支1種・幼稚園2種取得済┆",
      "Sci-mates 2023 準グランプリ",
    ].join("\n");

    expect(splitOgBioLines(bio)).toEqual([
      "TSU20C(心理) → Saitama Univ. '21PS(教育特支) → Web Engineer '25",
      "┆小学1種・中高1種(英語)・特支1種・幼稚園2種取得済┆",
      "Sci-mates 2023 準グランプリ",
    ]);
  });

  it("appends ellipsis when lines exceed the layout limit", () => {
    const bio = Array.from({ length: 6 }, (_, index) => `行${index + 1}`).join(
      "\n",
    );

    const lines = splitOgBioLines(bio);
    expect(lines).toHaveLength(5);
    expect(lines[4]).toMatch(/……$/);
  });
});

describe("splitOgBioLineSegments", () => {
  it("isolates line-prefix symbols from following latin words", () => {
    expect(splitOgBioLineSegments("┆Saidai Contest 2023 準グランプリ")).toEqual(
      ["┆", "Saidai", "Contest", "2023", "準グランプリ"],
    );
  });
});
