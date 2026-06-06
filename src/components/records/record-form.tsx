"use client";

import { useActionState, useState } from "react";
import {
  createRecords,
  type RecordActionState,
} from "@/app/actions/records";
import {
  CATEGORY_LABELS,
  DRINK_CATEGORIES,
} from "@/lib/constants/categories";
import type { RecordCategory } from "@/lib/types/record";
import { getTodayDateString } from "@/lib/utils/date";
import { FlavorMetricsInput } from "./flavor-metrics-input";
import { RatingInput } from "./rating-input";

const initialState: RecordActionState | null = null;

export function RecordForm() {
  const [state, formAction, pending] = useActionState(
    createRecords,
    initialState,
  );
  const [drinkCategory, setDrinkCategory] = useState<RecordCategory>(
    "japanese-sake",
  );
  const [includeFood, setIncludeFood] = useState(true);

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
        <h2 className="text-lg font-semibold text-zinc-900">お酒</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="drink_category"
              className="mb-1.5 block text-sm font-medium text-zinc-700"
            >
              カテゴリ
            </label>
            <select
              id="drink_category"
              name="drink_category"
              required
              value={drinkCategory}
              onChange={(event) =>
                setDrinkCategory(event.target.value as RecordCategory)
              }
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            >
              {DRINK_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="drink_name"
              className="mb-1.5 block text-sm font-medium text-zinc-700"
            >
              名前
            </label>
            <input
              id="drink_name"
              name="drink_name"
              type="text"
              required
              placeholder="銘柄名・商品名"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            />
          </div>

          <div>
            <label
              htmlFor="drink_sub_info"
              className="mb-1.5 block text-sm font-medium text-zinc-700"
            >
              補助情報
            </label>
            <input
              id="drink_sub_info"
              name="drink_sub_info"
              type="text"
              placeholder="蔵元、スタイル、生産地 など"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            />
          </div>

          <RatingInput name="drink_rating" label="総合評価" />
          <FlavorMetricsInput prefix="drink" category={drinkCategory} />

          <div>
            <label
              htmlFor="drink_comment"
              className="mb-1.5 block text-sm font-medium text-zinc-700"
            >
              メモ
            </label>
            <textarea
              id="drink_comment"
              name="drink_comment"
              rows={3}
              placeholder="感想やメモ"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="include_food"
            checked={includeFood}
            onChange={(event) => setIncludeFood(event.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 accent-zinc-900"
          />
          <span className="text-lg font-semibold text-zinc-900">
            おつまみも記録する
          </span>
        </label>

        {includeFood ? (
          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="food_name"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                おつまみの名前
              </label>
              <input
                id="food_name"
                name="food_name"
                type="text"
                placeholder="枝豆、焼き鳥 など"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <div>
              <label
                htmlFor="food_sub_info"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                補助情報
              </label>
              <input
                id="food_sub_info"
                name="food_sub_info"
                type="text"
                placeholder="ジャンル、店名 など"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <RatingInput name="food_rating" label="総合評価" />
            <FlavorMetricsInput prefix="food" category="food" />

            <div>
              <label
                htmlFor="food_comment"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                メモ
              </label>
              <textarea
                id="food_comment"
                name="food_comment"
                rows={3}
                placeholder="感想やメモ"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
              />
            </div>
          </div>
        ) : null}
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
