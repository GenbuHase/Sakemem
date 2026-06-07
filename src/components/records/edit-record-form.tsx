"use client";

import { useActionState, useState } from "react";
import {
  updateRecord,
  type RecordActionState,
} from "@/app/actions/records";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Select, TextInput } from "@/components/ui/inputs";
import {
  CATEGORY_LABELS,
  DRINK_CATEGORIES,
  isFoodCategory,
} from "@/lib/constants/categories";
import type { RecordCategory, SakememRecord } from "@/lib/types/record";
import { RecordCoreFields } from "./record-core-fields";

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

  const isFood = isFoodCategory(record.category);
  const categoryOptions = isFood
    ? (["food"] as const satisfies readonly RecordCategory[])
    : DRINK_CATEGORIES;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={record.id} />

      <TextInput
        id="date"
        name="date"
        type="date"
        label="日付"
        required
        defaultValue={record.date}
      />

      {/*
        おつまみカテゴリの編集ではカテゴリ変更不可。
        disabled な select は送信されないため、hidden で値を保持する。
      */}
      {isFood ? <input type="hidden" name="category" value="food" /> : null}
      <Select
        id="category"
        name={isFood ? undefined : "category"}
        label="カテゴリ"
        required
        value={category}
        onChange={(event) => setCategory(event.target.value as RecordCategory)}
        disabled={isFood}
      >
        {categoryOptions.map((value) => (
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
        namePlaceholder={isFood ? "枝豆、焼き鳥 など" : "銘柄名・商品名"}
        subInfoPlaceholder={
          isFood ? "ジャンル、店名 など" : "蔵元、スタイル、生産地 など"
        }
        defaultName={record.name}
        defaultSubInfo={record.sub_info ?? ""}
        defaultRating={record.rating}
        defaultComment={record.comment ?? ""}
        defaultFlavorMetrics={record.flavor_metrics}
      />

      {state?.error ? (
        <FormMessage variant="error">{state.error}</FormMessage>
      ) : null}

      <Button type="submit" fullWidth size="lg" disabled={pending}>
        {pending ? "更新中..." : "変更を保存"}
      </Button>
    </form>
  );
}
