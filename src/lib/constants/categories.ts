import {
  RECORD_CATEGORIES,
  type RecordCategory,
} from "@/lib/types/record";

export const CATEGORY_LABELS: Record<RecordCategory, string> = {
  "japanese-sake": "日本酒",
  beer: "ビール",
  wine: "ワイン",
  sour: "サワー",
  shochu: "焼酎",
  whiskey: "ウイスキー",
  liqueur: "リキュール",
  cocktail: "カクテル",
  food: "おつまみ",
  other: "その他",
};

export const DRINK_CATEGORIES = RECORD_CATEGORIES.filter(
  (category) => category !== "food",
);

export function getCategoryLabel(category: RecordCategory): string {
  return CATEGORY_LABELS[category];
}

export function isFoodCategory(category: RecordCategory): boolean {
  return category === "food";
}
