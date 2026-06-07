import type { RecordAnalysis } from "@/lib/records/analyze-records";

type RecordStatsProps = {
  analysis: RecordAnalysis;
};

export function RecordStats({ analysis }: RecordStatsProps) {
  if (analysis.total === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-zinc-900">分析</h2>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-zinc-50 px-3 py-2">
          <dt className="text-xs text-zinc-500">記録数</dt>
          <dd className="mt-0.5 text-xl font-semibold text-zinc-900">
            {analysis.total}
          </dd>
        </div>
        <div className="rounded-lg bg-zinc-50 px-3 py-2">
          <dt className="text-xs text-zinc-500">お酒</dt>
          <dd className="mt-0.5 text-xl font-semibold text-zinc-900">
            {analysis.drinkCount}
          </dd>
        </div>
        <div className="rounded-lg bg-zinc-50 px-3 py-2">
          <dt className="text-xs text-zinc-500">おつまみ</dt>
          <dd className="mt-0.5 text-xl font-semibold text-zinc-900">
            {analysis.foodCount}
          </dd>
        </div>
        <div className="rounded-lg bg-zinc-50 px-3 py-2">
          <dt className="text-xs text-zinc-500">ペア記録</dt>
          <dd className="mt-0.5 text-xl font-semibold text-zinc-900">
            {analysis.pairedSessionCount}
          </dd>
        </div>
      </dl>

      {analysis.categoryStats.length > 0 ? (
        <div className="mt-5">
          <h3 className="text-sm font-medium text-zinc-700">カテゴリ別</h3>
          <ul className="mt-2 space-y-2">
            {analysis.categoryStats.map((stat) => (
              <li
                key={stat.category}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-zinc-700">{stat.label}</span>
                <span className="text-zinc-500">
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

      {analysis.topRated.length > 0 ? (
        <div className="mt-5">
          <h3 className="text-sm font-medium text-zinc-700">高評価トップ5</h3>
          <ul className="mt-2 space-y-2">
            {analysis.topRated.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="truncate text-zinc-700">
                  {item.name}
                  <span className="ml-2 text-zinc-400">{item.label}</span>
                </span>
                <span className="shrink-0 font-medium text-zinc-900">
                  ★{item.rating}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
