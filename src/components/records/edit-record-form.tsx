"use client";

import { useActionState, useState } from "react";
import {
  updateRecord,
  type RecordActionState,
} from "@/app/actions/records";
import {
  CATEGORY_LABELS,
  DRINK_CATEGORIES,
} from "@/lib/constants/categories";
import type { RecordCategory, SakememRecord } from "@/lib/types/record";
import { FlavorMetricsInput } from "./flavor-metrics-input";
import { RatingInput } from "./rating-input";

const initialState: RecordActionState | null = null;

type EditRecordFormProps = {
  record: SakememRecord;
};

export function EditRecordForm({ record }: EditRecordFormProps) {
  const [state, formAction, pending] = useActionState(
    updateRecord,
    initialState,
  );
  const [category, setCategory] = useState<RecordCategory>(record.category);

  const categories =
    record.category === "food"
      ? (["food"] as const)
      : DRINK_CATEGORIES;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={record.id} />

      <div>
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
          defaultValue={record.date}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
        />
      </div>

      <div>
        <label
          htmlFor="category"
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          カテゴリ
        </label>
        {record.category === "food" ? (
          <input type="hidden" name="category" value="food" />
        ) : null}
        <select
          id="category"
          name={record.category === "food" ? undefined : "category"}
          required
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as RecordCategory)
          }
          disabled={record.category === "food"}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-50"
        >
          {categories.map((value) => (
            <option key={value} value={value}>
              {CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          名前
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={record.name}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
        />
      </div>

      <div>
        <label
          htmlFor="sub_info"
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          補助情報
        </label>
        <input
          id="sub_info"
          name="sub_info"
          type="text"
          defaultValue={record.sub_info ?? ""}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
        />
      </div>

      <RatingInput
        name="rating"
        label="総合評価"
        defaultValue={record.rating}
      />
      <FlavorMetricsInput
        prefix="record"
        category={category}
        defaultValues={record.flavor_metrics}
      />

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
          defaultValue={record.comment ?? ""}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
        />
      </div>

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
        {pending ? "更新中..." : "変更を保存"}
      </button>
    </form>
  );
}
