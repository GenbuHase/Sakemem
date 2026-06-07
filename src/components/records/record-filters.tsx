import { Button, LinkButton } from "@/components/ui/button";
import { Select, TextInput } from "@/components/ui/inputs";
import {
  CATEGORY_LABELS,
  DRINK_CATEGORIES,
} from "@/lib/constants/categories";
import type { RecordFilters } from "@/lib/records/filter-records";

type RecordFiltersFormProps = {
  filters: RecordFilters;
};

function buildActiveFilterLabels(filters: RecordFilters): string[] {
  const labels: string[] = [];

  if (filters.query) {
    labels.push(`「${filters.query}」`);
  }
  if (filters.kind === "drink") {
    labels.push("お酒のみ");
  }
  if (filters.kind === "food") {
    labels.push("おつまみのみ");
  }
  if (filters.category) {
    labels.push(CATEGORY_LABELS[filters.category]);
  }

  return labels;
}

export function RecordFiltersForm({ filters }: RecordFiltersFormProps) {
  const activeLabels = buildActiveFilterLabels(filters);
  const hasActiveFilters = activeLabels.length > 0;

  return (
    <div className="space-y-3">
      <form
        method="get"
        className="rounded-xl border border-zinc-200 bg-white p-4"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[12rem] flex-1">
            <TextInput
              id="q"
              name="q"
              type="search"
              label="キーワード"
              defaultValue={filters.query ?? ""}
              placeholder="名前・蔵元・メモで検索"
            />
          </div>

          <div className="w-full sm:w-40">
            <Select
              id="kind"
              name="kind"
              label="種別"
              defaultValue={filters.kind ?? "all"}
            >
              <option value="all">すべて</option>
              <option value="drink">お酒のみ</option>
              <option value="food">おつまみのみ</option>
            </Select>
          </div>

          <div className="w-full sm:w-44">
            <Select
              id="category"
              name="category"
              label="カテゴリ"
              defaultValue={filters.category ?? ""}
            >
              <option value="">すべて</option>
              {DRINK_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
              <option value="food">{CATEGORY_LABELS.food}</option>
            </Select>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <Button type="submit" className="flex-1 sm:flex-none">
              検索
            </Button>
            {hasActiveFilters ? (
              <LinkButton
                variant="secondary"
                href="/records"
                className="flex-1 sm:flex-none"
              >
                クリア
              </LinkButton>
            ) : null}
          </div>
        </div>
      </form>

      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-zinc-500">絞り込み:</span>
          {activeLabels.map((label) => (
            <span
              key={label}
              className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-zinc-700"
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
