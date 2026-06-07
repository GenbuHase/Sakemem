import Link from "next/link";
import {
  CATEGORY_LABELS,
  DRINK_CATEGORIES,
} from "@/lib/constants/categories";
import type { RecordFilters } from "@/lib/records/filter-records";

type RecordFiltersProps = {
  filters: RecordFilters;
};

export function RecordFiltersForm({ filters }: RecordFiltersProps) {
  return (
    <form
      method="get"
      className="rounded-xl border border-zinc-200 bg-white p-4"
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[12rem] flex-1">
          <label
            htmlFor="q"
            className="mb-1.5 block text-sm font-medium text-zinc-700"
          >
            キーワード
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={filters.query ?? ""}
            placeholder="名前・蔵元・メモで検索"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          />
        </div>

        <div className="w-full sm:w-40">
          <label
            htmlFor="kind"
            className="mb-1.5 block text-sm font-medium text-zinc-700"
          >
            種別
          </label>
          <select
            id="kind"
            name="kind"
            defaultValue={filters.kind ?? "all"}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          >
            <option value="all">すべて</option>
            <option value="drink">お酒のみ</option>
            <option value="food">おつまみのみ</option>
          </select>
        </div>

        <div className="w-full sm:w-44">
          <label
            htmlFor="category"
            className="mb-1.5 block text-sm font-medium text-zinc-700"
          >
            カテゴリ
          </label>
          <select
            id="category"
            name="category"
            defaultValue={filters.category ?? ""}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          >
            <option value="">すべて</option>
            {DRINK_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
            <option value="food">{CATEGORY_LABELS.food}</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          検索
        </button>

        <Link
          href="/records"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          クリア
        </Link>
      </div>
    </form>
  );
}
