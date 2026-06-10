import { describe, expect, it } from "vitest";
import {
  getDrinkStyleLabel,
  getFlavorMetricsForStyle,
  parseDrinkStyle,
} from "@/lib/constants/drink-styles";

describe("parseDrinkStyle", () => {
  it("accepts valid whiskey style", () => {
    expect(parseDrinkStyle("whiskey", "scotch")).toBe("scotch");
  });

  it("rejects invalid style for category", () => {
    expect(parseDrinkStyle("whiskey", "red")).toBeNull();
  });

  it("returns null for food category", () => {
    expect(parseDrinkStyle("food", "scotch")).toBeNull();
  });
});

describe("getDrinkStyleLabel", () => {
  it("returns label for wine style", () => {
    expect(getDrinkStyleLabel("wine", "white")).toBe("白");
  });
});

describe("getFlavorMetricsForStyle", () => {
  it("returns white-wine metrics without tannin", () => {
    const keys =
      getFlavorMetricsForStyle("wine", "white")?.map((metric) => metric.key) ??
      [];
    expect(keys).toEqual(["acidity", "aroma", "sweetness"]);
    expect(keys).not.toContain("tannin");
  });

  it("returns bourbon metrics with sweetness instead of smoky", () => {
    const keys =
      getFlavorMetricsForStyle("whiskey", "bourbon")?.map(
        (metric) => metric.key,
      ) ?? [];
    expect(keys).toEqual(["aroma", "sweetness", "finish"]);
    expect(keys).not.toContain("smoky");
  });
});
