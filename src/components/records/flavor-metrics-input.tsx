import { Select } from "@/components/ui/inputs";
import { getFlavorMetricDefs } from "@/lib/constants/flavor-metrics";
import type { WineStyle } from "@/lib/constants/wine";
import type { FlavorMetrics, RecordCategory } from "@/lib/types/record";

type FlavorMetricsInputProps = {
  prefix: string;
  category: RecordCategory;
  wineStyle?: WineStyle | null;
  defaultValues?: FlavorMetrics;
};

const RATING_VALUES = [1, 2, 3, 4, 5] as const;

export function FlavorMetricsInput({
  prefix,
  category,
  wineStyle,
  defaultValues = {},
}: FlavorMetricsInputProps) {
  const metrics = getFlavorMetricDefs(category, wineStyle);

  if (metrics.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-700">味の評価（1〜5・任意）</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {metrics.map(({ key, label }) => (
          <label key={key} className="block text-sm">
            <span className="mb-1.5 block text-zinc-600">{label}</span>
            <Select
              name={`${prefix}_flavor_${key}`}
              defaultValue={defaultValues[key]?.toString() ?? ""}
            >
              <option value="">未評価</option>
              {RATING_VALUES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </label>
        ))}
      </div>
    </div>
  );
}
