"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import {
  parseFlavorMetrics,
  parseOptionalRating,
  parseOptionalText,
} from "@/lib/records/parse-form";
import {
  RECORD_CATEGORIES,
  type FlavorMetrics,
  type RecordCategory,
  type SakememRecord,
} from "@/lib/types/record";

export type RecordActionState = {
  error?: string;
};

type RecordInsert = {
  user_id: string;
  pair_id: string | null;
  date: string;
  category: RecordCategory;
  name: string;
  sub_info: string | null;
  rating: number | null;
  flavor_metrics: FlavorMetrics;
  comment: string | null;
};

function isRecordCategory(value: string): value is RecordCategory {
  return RECORD_CATEGORIES.includes(value as RecordCategory);
}

export async function getRecords(): Promise<SakememRecord[]> {
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .from("records")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("記録の取得に失敗しました。");
  }

  return (data ?? []) as SakememRecord[];
}

export async function getRecord(id: string): Promise<SakememRecord | null> {
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("記録の取得に失敗しました。");
  }

  return (data as SakememRecord | null) ?? null;
}

export async function createRecords(
  _prevState: RecordActionState | null,
  formData: FormData,
): Promise<RecordActionState> {
  const { supabase, user } = await requireUser();

  const date = String(formData.get("date") ?? "").trim();
  const drinkCategory = String(formData.get("drink_category") ?? "").trim();
  const drinkName = String(formData.get("drink_name") ?? "").trim();
  const includeFood = formData.get("include_food") === "on";
  const foodName = String(formData.get("food_name") ?? "").trim();

  if (!date || !drinkCategory || !drinkName) {
    return { error: "日付、お酒のカテゴリ、名前は必須です。" };
  }

  if (!isRecordCategory(drinkCategory) || drinkCategory === "food") {
    return { error: "お酒のカテゴリが不正です。" };
  }

  if (includeFood && !foodName) {
    return { error: "おつまみを記録する場合は名前を入力してください。" };
  }

  const pairId = includeFood ? randomUUID() : null;

  const records: RecordInsert[] = [
    {
      user_id: user.id,
      pair_id: pairId,
      date,
      category: drinkCategory,
      name: drinkName,
      sub_info: parseOptionalText(formData, "drink_sub_info"),
      rating: parseOptionalRating(formData, "drink_rating"),
      flavor_metrics: parseFlavorMetrics(formData, "drink", drinkCategory),
      comment: parseOptionalText(formData, "drink_comment"),
    },
  ];

  if (includeFood) {
    records.push({
      user_id: user.id,
      pair_id: pairId,
      date,
      category: "food",
      name: foodName,
      sub_info: parseOptionalText(formData, "food_sub_info"),
      rating: parseOptionalRating(formData, "food_rating"),
      flavor_metrics: parseFlavorMetrics(formData, "food", "food"),
      comment: parseOptionalText(formData, "food_comment"),
    });
  }

  const { error } = await supabase.from("records").insert(records);

  if (error) {
    return { error: "記録の保存に失敗しました。" };
  }

  revalidatePath("/records");
  redirect("/records");
}

export async function updateRecord(
  _prevState: RecordActionState | null,
  formData: FormData,
): Promise<RecordActionState> {
  const { supabase } = await requireUser();

  const id = String(formData.get("id") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!id || !date || !category || !name) {
    return { error: "必須項目を入力してください。" };
  }

  if (!isRecordCategory(category)) {
    return { error: "カテゴリが不正です。" };
  }

  const { error } = await supabase
    .from("records")
    .update({
      date,
      category,
      name,
      sub_info: parseOptionalText(formData, "sub_info"),
      rating: parseOptionalRating(formData, "rating"),
      flavor_metrics: parseFlavorMetrics(formData, "record", category),
      comment: parseOptionalText(formData, "comment"),
    })
    .eq("id", id);

  if (error) {
    return { error: "記録の更新に失敗しました。" };
  }

  revalidatePath("/records");
  redirect("/records");
}

export async function deleteRecord(id: string): Promise<void> {
  const { supabase } = await requireUser();

  const { data: record, error: fetchError } = await supabase
    .from("records")
    .select("pair_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    throw new Error("記録の取得に失敗しました。");
  }

  if (!record) {
    throw new Error("記録が見つかりません。");
  }

  const { error } = record.pair_id
    ? await supabase.from("records").delete().eq("pair_id", record.pair_id)
    : await supabase.from("records").delete().eq("id", id);

  if (error) {
    throw new Error("記録の削除に失敗しました。");
  }

  revalidatePath("/records");
}
