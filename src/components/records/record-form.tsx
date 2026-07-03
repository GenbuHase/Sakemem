"use client";

import { useActionState, useState } from "react";
import {
  createRecords,
  type RecordActionState,
} from "@/app/actions/records";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Select, TextInput } from "@/components/ui/inputs";
import { SectionCard } from "@/components/ui/section-card";
import { VisibilitySelector } from "@/components/sharing/visibility-selector";
import {
  CATEGORY_LABELS,
  isFoodCategory,
} from "@/lib/constants/categories";
import { RECORD_CATEGORIES, type RecordCategory } from "@/lib/types/record";
import { getTodayDateString } from "@/lib/utils/date";
import { PairFoodFields } from "./pair-food-fields";
import { RecordCoreFields } from "./record-core-fields";

const initialState: RecordActionState | null = null;

export function RecordForm() {
  const [state, formAction, pending] = useActionState(
    createRecords,
    initialState,
  );
  const [category, setCategory] = useState<RecordCategory>("japanese-sake");
  const [includePairFood, setIncludePairFood] = useState(false);
  const [pairFoodCount, setPairFoodCount] = useState(1);

  const isFood = isFoodCategory(category);

  return (
    <form action={formAction} className="space-y-6">
      <SectionCard title="基本情報">
        <div className="space-y-4">
          <TextInput
            id="date"
            name="date"
            type="date"
            label="日付"
            required
            defaultValue={getTodayDateString()}
          />
          <TextInput
            id="place"
            name="place"
            label="場所"
            placeholder="居酒屋名、自宅 など"
          />
        </div>
      </SectionCard>

      <SectionCard title="記録">
        <div className="space-y-4">
          <Select
            id="category"
            name="category"
            label="カテゴリ"
            required
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as RecordCategory)
            }
          >
            {RECORD_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {CATEGORY_LABELS[value]}
              </option>
            ))}
          </Select>

          <RecordCoreFields
            key={category}
            prefix="record"
            category={category}
            enableSakeSuggest={category === "japanese-sake"}
            nameLabel={isFood ? "おつまみの名前" : "名前"}
            namePlaceholder={
              isFood ? "枝豆、焼き鳥 など" : "銘柄名・商品名"
            }
            subInfoPlaceholder={
              isFood ? "ジャンル、調理法 など" : "スタイル、生産地 など"
            }
          />

          {!isFood ? (
            <PairFoodSection
              includePairFood={includePairFood}
              pairFoodCount={pairFoodCount}
              onTogglePair={setIncludePairFood}
              onIncrementCount={() => setPairFoodCount((count) => count + 1)}
              onDecrementCount={() => setPairFoodCount((count) => count - 1)}
            />
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title="公開設定">
        <VisibilitySelector />
      </SectionCard>

      {state?.error ? (
        <FormMessage variant="error">{state.error}</FormMessage>
      ) : null}

      <Button type="submit" fullWidth size="lg" disabled={pending}>
        {pending ? "保存中..." : "記録を保存"}
      </Button>
    </form>
  );
}

type PairFoodSectionProps = {
  includePairFood: boolean;
  pairFoodCount: number;
  onTogglePair(checked: boolean): void;
  onIncrementCount(): void;
  onDecrementCount(): void;
};

function PairFoodSection({
  includePairFood,
  pairFoodCount,
  onTogglePair,
  onIncrementCount,
  onDecrementCount,
}: PairFoodSectionProps) {
  return (
    <div className="border-t border-zinc-100 pt-4">
      <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition hover:bg-zinc-50">
        <input
          type="checkbox"
          name="include_pair_food"
          checked={includePairFood}
          onChange={(event) => onTogglePair(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-zinc-900"
        />
        <span>
          <span className="block text-sm font-medium text-zinc-900">
            おつまみも同時に記録する（ペア）
          </span>
          <span className="mt-0.5 block text-xs text-zinc-500">
            同じ日のお酒とおつまみをまとめて記録できます
          </span>
        </span>
      </label>

      {includePairFood ? (
        <div className="mt-3 space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <input type="hidden" name="pair_food_count" value={pairFoodCount} />
          <div className="space-y-3">
            {Array.from({ length: pairFoodCount }, (_, index) => (
              <PairFoodFields
                key={index}
                index={index}
                required={index === 0}
                onRemove={
                  pairFoodCount > 1 && index === pairFoodCount - 1
                    ? onDecrementCount
                    : undefined
                }
              />
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onIncrementCount}>
            + おつまみを追加
          </Button>
        </div>
      ) : null}
    </div>
  );
}
