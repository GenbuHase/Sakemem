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

export function RecordFiltersForm({ filters }: RecordFiltersFormProps) {
  return (
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

        <Button type="submit">検索</Button>
        <LinkButton variant="secondary" href="/records">
          クリア
        </LinkButton>
      </div>
    </form>
  );
}
