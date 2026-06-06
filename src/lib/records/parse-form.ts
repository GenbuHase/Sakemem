import { FLAVOR_METRICS_BY_CATEGORY } from "@/lib/constants/flavor-metrics";
import type { FlavorMetrics, RecordCategory } from "@/lib/types/record";

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
    if (Number.isInteger(value) && value >= 1 && value <= 5) {
      metrics[key] = value;
    }
  }

  return metrics;
}

export function parseOptionalRating(
  formData: FormData,
  fieldName: string,
): number | null {
  const raw = formData.get(fieldName);
  if (raw === null || raw === "") return null;

  const value = Number(raw);
  if (Number.isInteger(value) && value >= 1 && value <= 5) {
    return value;
  }

  return null;
}

export function parseOptionalText(
  formData: FormData,
  fieldName: string,
): string | null {
  const value = String(formData.get(fieldName) ?? "").trim();
  return value || null;
}
