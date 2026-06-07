"use client";

import { useActionState, useState } from "react";
import {
  createRecords,
  type RecordActionState,
} from "@/app/actions/records";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Select, TextInput } from "@/components/ui/inputs";
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
    <form action={formAction} className="space-y-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-zinc-900">基本情報</h2>
        <div className="mt-4">
          <TextInput
            id="date"
            name="date"
            type="date"
            label="日付"
            required
            defaultValue={getTodayDateString()}
          />
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-zinc-900">記録</h2>
        <div className="mt-4 space-y-4">
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
              isFood ? "ジャンル、店名 など" : "蔵元、スタイル、生産地 など"
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
      </section>

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
    <div className="border-t border-zinc-200 pt-4">
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="include_pair_food"
          checked={includePairFood}
          onChange={(event) => onTogglePair(event.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 accent-zinc-900"
        />
        <span className="text-sm font-medium text-zinc-900">
          おつまみも同時に記録する（ペア）
        </span>
      </label>

      {includePairFood ? (
        <div className="mt-4 space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <input
            type="hidden"
            name="pair_food_count"
            value={pairFoodCount}
          />
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
          <Button variant="ghost" size="sm" onClick={onIncrementCount}>
            + おつまみを追加
          </Button>
        </div>
      ) : null}
    </div>
  );
}
