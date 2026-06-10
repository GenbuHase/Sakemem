import type { FlavorMetricDef } from "@/lib/constants/flavor-metrics";

export const WINE_STYLES = [
  "red",
  "white",
  "rose",
  "sparkling",
  "other",
] as const;

export type WineStyle = (typeof WINE_STYLES)[number];

export const WINE_STYLE_LABELS: Record<WineStyle, string> = {
  red: "赤",
  white: "白",
  rose: "ロゼ",
  sparkling: "スパークリング",
  other: "その他",
};

export const FLAVOR_METRICS_BY_WINE_STYLE: Record<
  WineStyle,
  FlavorMetricDef[]
> = {
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
};

/** 表示用: ワインで使う可能性のある評価軸ラベル */
export const WINE_FLAVOR_METRIC_LABELS: Record<string, string> = {
  body: "ボディ",
  tannin: "渋み",
  acidity: "酸味",
  aroma: "香り",
  sweetness: "甘口度",
};

export function getWineFlavorMetrics(
  style: WineStyle | null | undefined,
): FlavorMetricDef[] {
  return FLAVOR_METRICS_BY_WINE_STYLE[style ?? "other"];
}

export function parseWineStyle(value: FormDataEntryValue | null): WineStyle | null {
  if (typeof value !== "string" || !value) return null;
  return WINE_STYLES.includes(value as WineStyle)
    ? (value as WineStyle)
    : null;
}

export function encodeWineSubInfo(
  style: WineStyle | null,
  detail: string | null,
): string | null {
  const styleLabel = style ? WINE_STYLE_LABELS[style] : null;
  const trimmedDetail = detail?.trim() ?? "";

  if (!styleLabel && !trimmedDetail) return null;
  if (!styleLabel) return trimmedDetail;
  if (!trimmedDetail) return styleLabel;
  return `${styleLabel} / ${trimmedDetail}`;
}

export function decodeWineSubInfo(subInfo: string | null): {
  style: WineStyle | null;
  detail: string;
} {
  if (!subInfo) {
    return { style: null, detail: "" };
  }

  const separatorIndex = subInfo.indexOf(" / ");
  if (separatorIndex === -1) {
    const style = labelToWineStyle(subInfo);
    return style
      ? { style, detail: "" }
      : { style: null, detail: subInfo };
  }

  const stylePart = subInfo.slice(0, separatorIndex);
  const detail = subInfo.slice(separatorIndex + 3);
  const style = labelToWineStyle(stylePart);

  if (!style) {
    return { style: null, detail: subInfo };
  }

  return { style, detail };
}

function labelToWineStyle(label: string): WineStyle | null {
  const entry = Object.entries(WINE_STYLE_LABELS).find(
    ([, value]) => value === label,
  );
  return entry ? (entry[0] as WineStyle) : null;
}
