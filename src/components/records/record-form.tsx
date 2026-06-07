"use client";

import { useActionState, useState } from "react";
import {
  createRecords,
  type RecordActionState,
} from "@/app/actions/records";
import {
  CATEGORY_LABELS,
  isFoodCategory,
} from "@/lib/constants/categories";
import { RECORD_CATEGORIES, type RecordCategory } from "@/lib/types/record";
import { getTodayDateString } from "@/lib/utils/date";
import { DrinkIdentityFields } from "./drink-identity-fields";
import { FlavorMetricsInput } from "./flavor-metrics-input";
import { RatingInput } from "./rating-input";

const initialState: RecordActionState | null = null;

type PairFoodFieldsProps = {
  index: number;
  required?: boolean;
  onRemove?: () => void;
};

function PairFoodFields({
  index,
  required = false,
  onRemove,
}: PairFoodFieldsProps) {
  const prefix = `pair_${index}`;
  const nameId = `${prefix}_name`;

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-zinc-900">
          おつまみ {index + 1}
        </h4>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="text-sm text-zinc-500 transition hover:text-zinc-700"
          >
            削除
          </button>
        ) : null}
      </div>

      <div>
        <label
          htmlFor={nameId}
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          おつまみの名前
        </label>
        <input
          id={nameId}
          name={`${prefix}_name`}
          type="text"
          required={required}
          placeholder="枝豆、焼き鳥 など"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
        />
      </div>

      <div>
        <label
          htmlFor={`${prefix}_sub_info`}
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          補助情報
        </label>
        <input
          id={`${prefix}_sub_info`}
          name={`${prefix}_sub_info`}
          type="text"
          placeholder="ジャンル、店名 など"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
        />
      </div>

      <RatingInput name={`${prefix}_rating`} label="総合評価" />
      <FlavorMetricsInput prefix={prefix} category="food" />

      <div>
        <label
          htmlFor={`${prefix}_comment`}
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          メモ
        </label>
        <textarea
          id={`${prefix}_comment`}
          name={`${prefix}_comment`}
          rows={3}
          placeholder="感想やメモ"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
        />
      </div>
    </div>
  );
}

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
          <label
            htmlFor="date"
            className="mb-1.5 block text-sm font-medium text-zinc-700"
          >
            日付
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={getTodayDateString()}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          />
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-zinc-900">記録</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="category"
              className="mb-1.5 block text-sm font-medium text-zinc-700"
            >
              カテゴリ
            </label>
            <select
              id="category"
              name="category"
              required
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as RecordCategory)
              }
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            >
              {RECORD_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <DrinkIdentityFields
            key={category}
            enableSakeSuggest={!isFood && category === "japanese-sake"}
            nameField="name"
            subInfoField="sub_info"
            nameId="name"
            subInfoId="sub_info"
            nameLabel={isFood ? "おつまみの名前" : "名前"}
            namePlaceholder={
              isFood ? "枝豆、焼き鳥 など" : "銘柄名・商品名"
            }
            subInfoPlaceholder={
              isFood ? "ジャンル、店名 など" : "蔵元、スタイル、生産地 など"
            }
          />

          <RatingInput name="rating" label="総合評価" />
          <FlavorMetricsInput prefix="record" category={category} />

          <div>
            <label
              htmlFor="comment"
              className="mb-1.5 block text-sm font-medium text-zinc-700"
            >
              メモ
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={3}
              placeholder="感想やメモ"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            />
          </div>

          {!isFood ? (
            <div className="border-t border-zinc-200 pt-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="include_pair_food"
                  checked={includePairFood}
                  onChange={(event) =>
                    setIncludePairFood(event.target.checked)
                  }
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
                            ? () => setPairFoodCount((count) => count - 1)
                            : undefined
                        }
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPairFoodCount((count) => count + 1)}
                    className="text-sm font-medium text-zinc-700 transition hover:text-zinc-900"
                  >
                    + おつまみを追加
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "保存中..." : "記録を保存"}
      </button>
    </form>
  );
}
