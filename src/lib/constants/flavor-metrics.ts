import { getWineFlavorMetrics, type WineStyle } from "@/lib/constants/wine";
import type { RecordCategory } from "@/lib/types/record";

export type FlavorMetricDef = {
  key: string;
  label: string;
};

export const FLAVOR_METRICS_BY_CATEGORY: Record<
  RecordCategory,
  FlavorMetricDef[]
> = {
  "japanese-sake": [
    { key: "sweetness", label: "甘み" },
    { key: "acidity", label: "酸味" },
    { key: "aroma", label: "香り" },
  ],
  beer: [
    { key: "bitterness", label: "苦味" },
    { key: "body", label: "コク" },
    { key: "aroma", label: "香り" },
  ],
  wine: [
    { key: "body", label: "ボディ" },
    { key: "acidity", label: "酸味" },
    { key: "aroma", label: "香り" },
  ],
  sour: [
    { key: "acidity", label: "酸味" },
    { key: "sweetness", label: "甘さ" },
  ],
  shochu: [
    { key: "aroma", label: "香り" },
    { key: "umami", label: "旨み" },
    { key: "finish", label: "キレ" },
  ],
  whiskey: [
    { key: "aroma", label: "香り" },
    { key: "smoky", label: "スモーキー" },
    { key: "finish", label: "キレ" },
  ],
  liqueur: [
    { key: "sweetness", label: "甘さ" },
    { key: "acidity", label: "酸味" },
    { key: "fruitiness", label: "果実感" },
  ],
  cocktail: [
    { key: "sweetness", label: "甘さ" },
    { key: "acidity", label: "酸味" },
    { key: "balance", label: "バランス" },
  ],
  food: [
    { key: "saltiness", label: "塩味" },
    { key: "umami", label: "旨み" },
    { key: "spiciness", label: "辛み" },
  ],
  other: [
    { key: "aroma", label: "香り" },
    { key: "body", label: "コク" },
    { key: "finish", label: "キレ" },
  ],
};

export function getFlavorMetricDefs(
  category: RecordCategory,
  wineStyle?: WineStyle | null,
): FlavorMetricDef[] {
  if (category === "wine") {
    return getWineFlavorMetrics(wineStyle);
  }

  return FLAVOR_METRICS_BY_CATEGORY[category];
}
