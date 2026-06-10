import type { FlavorMetricDef } from "@/lib/constants/flavor-metrics";
import { isFoodCategory } from "@/lib/constants/categories";
import type { RecordCategory } from "@/lib/types/record";

export type DrinkStyleOption = {
  key: string;
  label: string;
};

export const DRINK_STYLES_BY_CATEGORY = {
  "japanese-sake": [
    { key: "junmai", label: "純米" },
    { key: "ginjo", label: "吟醸" },
    { key: "daiginjo", label: "大吟醸" },
    { key: "honjozo", label: "本醸造" },
    { key: "namazake", label: "生酒" },
    { key: "other", label: "その他" },
  ],
  beer: [
    { key: "lager", label: "ラガー" },
    { key: "ale", label: "エール" },
    { key: "ipa", label: "IPA" },
    { key: "weizen", label: "ウィート" },
    { key: "stout", label: "スタウト" },
    { key: "other", label: "その他" },
  ],
  wine: [
    { key: "red", label: "赤" },
    { key: "white", label: "白" },
    { key: "rose", label: "ロゼ" },
    { key: "sparkling", label: "スパークリング" },
    { key: "other", label: "その他" },
  ],
  sour: [
    { key: "lemon", label: "レモン" },
    { key: "grapefruit", label: "グレフル" },
    { key: "calpis", label: "カルピス系" },
    { key: "other", label: "その他" },
  ],
  shochu: [
    { key: "imo", label: "芋" },
    { key: "mugi", label: "麦" },
    { key: "kome", label: "米" },
    { key: "other", label: "その他" },
  ],
  whiskey: [
    { key: "scotch", label: "スコッチ" },
    { key: "bourbon", label: "バーボン" },
    { key: "irish", label: "アイリッシュ" },
    { key: "japanese", label: "ジャパニーズ" },
    { key: "other", label: "その他" },
  ],
  liqueur: [
    { key: "fruit", label: "果実系" },
    { key: "herb", label: "ハーブ系" },
    { key: "cream", label: "クリーム系" },
    { key: "other", label: "その他" },
  ],
  cocktail: [
    { key: "short", label: "ショート" },
    { key: "long", label: "ロング" },
    { key: "highball", label: "ハイボール系" },
    { key: "other", label: "その他" },
  ],
} as const satisfies Record<
  Exclude<RecordCategory, "food" | "other">,
  readonly DrinkStyleOption[]
>;

export type DrinkCategoryWithStyles = keyof typeof DRINK_STYLES_BY_CATEGORY;

const FLAVOR_METRICS_BY_STYLE: Partial<
  Record<DrinkCategoryWithStyles, Record<string, FlavorMetricDef[]>>
> = {
  wine: {
    red: [
      { key: "body", label: "ボディ" },
      { key: "tannin", label: "渋み" },
      { key: "acidity", label: "酸味" },
    ],
    white: [
      { key: "acidity", label: "酸味" },
      { key: "aroma", label: "香り" },
      { key: "sweetness", label: "甘口度" },
    ],
    rose: [
      { key: "body", label: "ボディ" },
      { key: "acidity", label: "酸味" },
      { key: "aroma", label: "香り" },
    ],
    sparkling: [
      { key: "acidity", label: "酸味" },
      { key: "sweetness", label: "甘口度" },
      { key: "aroma", label: "香り" },
    ],
    other: [
      { key: "body", label: "ボディ" },
      { key: "acidity", label: "酸味" },
      { key: "aroma", label: "香り" },
    ],
  },
  whiskey: {
    scotch: [
      { key: "aroma", label: "香り" },
      { key: "smoky", label: "スモーキー" },
      { key: "finish", label: "キレ" },
    ],
    bourbon: [
      { key: "aroma", label: "香り" },
      { key: "sweetness", label: "甘み" },
      { key: "finish", label: "キレ" },
    ],
    irish: [
      { key: "aroma", label: "香り" },
      { key: "body", label: "ボディ" },
      { key: "finish", label: "キレ" },
    ],
    japanese: [
      { key: "aroma", label: "香り" },
      { key: "body", label: "ボディ" },
      { key: "finish", label: "キレ" },
    ],
    other: [
      { key: "aroma", label: "香り" },
      { key: "smoky", label: "スモーキー" },
      { key: "finish", label: "キレ" },
    ],
  },
};

/** 種類別評価軸の表示用ラベル（過去データの互換表示） */
export const STYLE_AWARE_FLAVOR_LABELS: Partial<
  Record<DrinkCategoryWithStyles, Record<string, string>>
> = {
  wine: {
    body: "ボディ",
    tannin: "渋み",
    acidity: "酸味",
    aroma: "香り",
    sweetness: "甘口度",
  },
  whiskey: {
    aroma: "香り",
    smoky: "スモーキー",
    finish: "キレ",
    sweetness: "甘み",
    body: "ボディ",
  },
};

const SUB_INFO_PLACEHOLDERS: Partial<Record<DrinkCategoryWithStyles, string>> =
  {
    "japanese-sake": "生産地、精米歩合 など",
    beer: "生産地、ホップ品種 など",
    wine: "生産地、ぶどう品種 など",
    sour: "ベース酒、割り方 など",
    shochu: "蒸留方法、熟成年数 など",
    whiskey: "蒸留所、熟成年数 など",
    liqueur: "ベース酒、風味 など",
    cocktail: "ベース酒、作り方 など",
  };

export function hasDrinkStyles(
  category: RecordCategory,
): category is DrinkCategoryWithStyles {
  return (
    !isFoodCategory(category) &&
    category !== "other" &&
    category in DRINK_STYLES_BY_CATEGORY
  );
}

export function getDrinkStyleOptions(
  category: RecordCategory,
): readonly DrinkStyleOption[] {
  if (!hasDrinkStyles(category)) {
    return [];
  }

  return DRINK_STYLES_BY_CATEGORY[category];
}

export function parseDrinkStyle(
  category: RecordCategory,
  value: FormDataEntryValue | null,
): string | null {
  if (!hasDrinkStyles(category)) {
    return null;
  }

  if (typeof value !== "string" || !value) {
    return null;
  }

  return getDrinkStyleOptions(category).some((option) => option.key === value)
    ? value
    : null;
}

export function getDrinkStyleLabel(
  category: RecordCategory,
  style: string | null | undefined,
): string | null {
  if (!style || !hasDrinkStyles(category)) {
    return null;
  }

  return (
    getDrinkStyleOptions(category).find((option) => option.key === style)
      ?.label ?? null
  );
}

export function getFlavorMetricsForStyle(
  category: RecordCategory,
  style: string | null | undefined,
): FlavorMetricDef[] | null {
  if (!hasDrinkStyles(category) || !style) {
    return null;
  }

  return FLAVOR_METRICS_BY_STYLE[category]?.[style] ?? null;
}

export function getSubInfoPlaceholderForCategory(
  category: RecordCategory,
): string | undefined {
  if (!hasDrinkStyles(category)) {
    return undefined;
  }

  return SUB_INFO_PLACEHOLDERS[category];
}
