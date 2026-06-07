import { isFoodCategory } from "@/lib/constants/categories";
import { FLAVOR_METRICS_BY_CATEGORY } from "@/lib/constants/flavor-metrics";
import {
  RECORD_CATEGORIES,
  type FlavorMetrics,
  type RecordCategory,
} from "@/lib/types/record";
import type { RecordWritePayload } from "./repository";

const MIN_RATING = 1;
const MAX_RATING = 5;

export function parseString(formData: FormData, fieldName: string): string {
  return String(formData.get(fieldName) ?? "").trim();
}

export function parseOptionalText(
  formData: FormData,
  fieldName: string,
): string | null {
  return parseString(formData, fieldName) || null;
}

export function parseOptionalRating(
  formData: FormData,
  fieldName: string,
): number | null {
  const raw = formData.get(fieldName);
  if (raw === null || raw === "") return null;

  const value = Number(raw);
  if (Number.isInteger(value) && value >= MIN_RATING && value <= MAX_RATING) {
    return value;
  }

  return null;
}

export function parseFlavorMetrics(
  formData: FormData,
  prefix: string,
  category: RecordCategory,
): FlavorMetrics {
  const metrics: FlavorMetrics = {};

  for (const { key } of FLAVOR_METRICS_BY_CATEGORY[category]) {
    const raw = formData.get(`${prefix}_flavor_${key}`);
    if (raw === null || raw === "") continue;

    const value = Number(raw);
    if (Number.isInteger(value) && value >= MIN_RATING && value <= MAX_RATING) {
      metrics[key] = value;
    }
  }

  return metrics;
}

export function parseRecordCategory(value: string): RecordCategory | null {
  return RECORD_CATEGORIES.includes(value as RecordCategory)
    ? (value as RecordCategory)
    : null;
}

/**
 * フォームから 1 件分のレコード書き込みペイロードを構築する。
 * date / category / name の必須・型を検証して返す。
 */
export function parsePlace(formData: FormData): string | null {
  return parseOptionalText(formData, "place");
}

export function parseRecordWritePayload(
  formData: FormData,
  options: {
    prefix: string;
    date: string;
    category: RecordCategory;
    name: string;
    place?: string | null;
  },
): RecordWritePayload {
  const { prefix, date, category, name, place } = options;

  return {
    date,
    category,
    name,
    producer: isFoodCategory(category)
      ? null
      : parseOptionalText(formData, `${prefix}_producer`),
    sub_info: parseOptionalText(formData, `${prefix}_sub_info`),
    place: place ?? parsePlace(formData),
    rating: parseOptionalRating(formData, `${prefix}_rating`),
    flavor_metrics: parseFlavorMetrics(formData, prefix, category),
    comment: parseOptionalText(formData, `${prefix}_comment`),
  };
}
