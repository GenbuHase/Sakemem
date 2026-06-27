import { Button } from "@/components/ui/button";
import { Select, TextInput } from "@/components/ui/inputs";
import {
  CATEGORY_LABELS,
  DRINK_CATEGORIES,
} from "@/lib/constants/categories";
import type { RecordCategory } from "@/lib/types/record";
import type { RecordKindFilter } from "@/lib/records/filter-records";

type RecordFiltersFormProps = {
  query: string;
  kind: RecordKindFilter;
  category: RecordCategory | "";
  onQueryChange: (query: string) => void;
  onKindChange: (kind: RecordKindFilter) => void;
  onCategoryChange: (category: RecordCategory | "") => void;
  onClear: () => void;
};

function buildActiveFilterLabels(
  query: string,
  kind: RecordKindFilter,
  category: RecordCategory | "",
): string[] {
  const labels: string[] = [];

  if (query) {
    labels.push(`「${query}」`);
  }
  if (kind === "drink") {
    labels.push("お酒のみ");
  }
  if (kind === "food") {
    labels.push("おつまみのみ");
  }
  if (category) {
    labels.push(CATEGORY_LABELS[category]);
  }

  return labels;
}

export function RecordFiltersForm({
  query,
  kind,
  category,
  onQueryChange,
  onKindChange,
  onCategoryChange,
  onClear,
}: RecordFiltersFormProps) {
  const activeLabels = buildActiveFilterLabels(query, kind, category);
  const hasActiveFilters = activeLabels.length > 0;

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="rounded-xl border border-zinc-200 bg-white p-4"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <TextInput
              id="q"
              name="q"
              type="search"
              label="キーワード"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="名前・蔵元・メモで検索"
            />
          </div>

          <div className="w-full sm:w-40">
            <Select
              id="kind"
              name="kind"
              label="種別"
              value={kind}
              onChange={(e) => onKindChange(e.target.value as RecordKindFilter)}
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
              value={category}
              onChange={(e) =>
                onCategoryChange(e.target.value as RecordCategory | "")
              }
            >
              <option value="">すべて</option>
              {DRINK_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
              <option value="food">{CATEGORY_LABELS.food}</option>
            </Select>
          </div>

          {hasActiveFilters ? (
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                type="button"
                variant="secondary"
                onClick={onClear}
                className="flex-1 sm:flex-none"
              >
                クリア
              </Button>
            </div>
          ) : null}
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
