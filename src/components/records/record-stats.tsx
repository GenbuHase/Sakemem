import type { RecordAnalysis } from "@/lib/records/analyze-records";
import { SectionCard } from "@/components/ui/section-card";

type RecordStatsProps = {
  analysis: RecordAnalysis;
};

export function RecordStats({ analysis }: RecordStatsProps) {
  if (analysis.total === 0) {
    return null;
  }

  return (
    <SectionCard title="分析">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatItem label="記録数" value={analysis.total} />
        <StatItem label="お酒" value={analysis.drinkCount} />
        <StatItem label="おつまみ" value={analysis.foodCount} />
        <StatItem label="ペア記録" value={analysis.pairedSessionCount} />
      </dl>

      {analysis.categoryStats.length > 0 ? (
        <div className="mt-5 border-t border-zinc-100 pt-5">
          <h3 className="text-sm font-medium text-zinc-700">カテゴリ別</h3>
          <ul className="mt-2 space-y-2">
            {analysis.categoryStats.map((stat) => (
              <li
                key={stat.category}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-zinc-700">{stat.label}</span>
                <span className="shrink-0 text-zinc-500">
                  {stat.count}件
                  {stat.avgRating !== null
                    ? ` · 平均 ${stat.avgRating}`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </SectionCard>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-zinc-50 px-3 py-2.5">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="mt-0.5 text-xl font-semibold tabular-nums text-zinc-900">
        {value}
      </dd>
    </div>
  );
}
