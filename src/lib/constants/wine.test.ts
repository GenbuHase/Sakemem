import { describe, expect, it } from "vitest";
import {
  decodeWineSubInfo,
  encodeWineSubInfo,
  getWineFlavorMetrics,
} from "@/lib/constants/wine";

describe("wine sub_info", () => {
  it("encodes style and detail", () => {
    expect(encodeWineSubInfo("white", "シャルドネ")).toBe("白 / シャルドネ");
  });

  it("decodes style and detail", () => {
    expect(decodeWineSubInfo("白 / シャルドネ")).toEqual({
      style: "white",
      detail: "シャルドネ",
    });
  });

  it("keeps legacy detail-only sub_info", () => {
    expect(decodeWineSubInfo("ブルゴーニュ")).toEqual({
      style: null,
      detail: "ブルゴーニュ",
    });
  });
});

describe("getWineFlavorMetrics", () => {
  it("returns white-wine metrics without tannin", () => {
    const keys = getWineFlavorMetrics("white").map((metric) => metric.key);
    expect(keys).toEqual(["acidity", "aroma", "sweetness"]);
    expect(keys).not.toContain("tannin");
  });

  it("returns red-wine metrics with tannin", () => {
    const keys = getWineFlavorMetrics("red").map((metric) => metric.key);
    expect(keys).toContain("tannin");
  });
});
