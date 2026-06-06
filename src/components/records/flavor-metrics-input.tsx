import { FLAVOR_METRICS_BY_CATEGORY } from "@/lib/constants/flavor-metrics";
import type { FlavorMetrics, RecordCategory } from "@/lib/types/record";

type FlavorMetricsInputProps = {
  prefix: string;
  category: RecordCategory;
  defaultValues?: FlavorMetrics;
};

export function FlavorMetricsInput({
  prefix,
  category,
  defaultValues = {},
}: FlavorMetricsInputProps) {
  const metrics = FLAVOR_METRICS_BY_CATEGORY[category];

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
            <select
              name={`${prefix}_flavor_${key}`}
              defaultValue={defaultValues[key]?.toString() ?? ""}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            >
              <option value="">未評価</option>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}
