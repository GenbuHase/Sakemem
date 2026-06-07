"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import {
  isOppositeRecordType,
  filterLinkCandidates,
  getPartners,
} from "@/lib/records/pairing";
import {
  parseFlavorMetrics,
  parseOptionalRating,
  parseOptionalText,
} from "@/lib/records/parse-form";
import { isFoodCategory } from "@/lib/constants/categories";
import {
  RECORD_CATEGORIES,
  type FlavorMetrics,
  type RecordCategory,
  type SakememRecord,
} from "@/lib/types/record";

export type RecordActionState = {
  error?: string;
};

export type RecordPairingContext = {
  record: SakememRecord;
  partners: SakememRecord[];
  linkCandidates: SakememRecord[];
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

async function clearOrphanedPair(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  pairId: string,
): Promise<void> {
  const { data: remaining, error } = await supabase
    .from("records")
    .select("id")
    .eq("pair_id", pairId);

  if (error) {
    throw new Error("ペア情報の取得に失敗しました。");
  }

  if ((remaining ?? []).length <= 1) {
    const { error: updateError } = await supabase
      .from("records")
      .update({ pair_id: null })
      .eq("pair_id", pairId);

    if (updateError) {
      throw new Error("ペアの解除に失敗しました。");
    }
  }
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

export async function getRecordPairingContext(
  id: string,
): Promise<RecordPairingContext | null> {
  const { supabase } = await requireUser();
  const record = await getRecord(id);

  if (!record) {
    return null;
  }

  const { data, error } = await supabase
    .from("records")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("記録の取得に失敗しました。");
  }

  const records = (data ?? []) as SakememRecord[];

  return {
    record,
    partners: getPartners(records, record),
    linkCandidates: filterLinkCandidates(records, record),
  };
}

export async function createRecords(
  _prevState: RecordActionState | null,
  formData: FormData,
): Promise<RecordActionState> {
  const { supabase, user } = await requireUser();

  const date = String(formData.get("date") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!date || !category || !name) {
    return { error: "日付、カテゴリ、名前は必須です。" };
  }

  if (!isRecordCategory(category)) {
    return { error: "カテゴリが不正です。" };
  }

  const records: RecordInsert[] = [];

  if (isFoodCategory(category)) {
    records.push({
      user_id: user.id,
      pair_id: null,
      date,
      category: "food",
      name,
      sub_info: parseOptionalText(formData, "sub_info"),
      rating: parseOptionalRating(formData, "rating"),
      flavor_metrics: parseFlavorMetrics(formData, "record", "food"),
      comment: parseOptionalText(formData, "comment"),
    });
  } else {
    const includePairFood = formData.get("include_pair_food") === "on";

    records.push({
      user_id: user.id,
      pair_id: null,
      date,
      category,
      name,
      sub_info: parseOptionalText(formData, "sub_info"),
      rating: parseOptionalRating(formData, "rating"),
      flavor_metrics: parseFlavorMetrics(formData, "record", category),
      comment: parseOptionalText(formData, "comment"),
    });

    if (includePairFood) {
      const pairName = String(formData.get("pair_name") ?? "").trim();

      if (!pairName) {
        return {
          error: "おつまみを同時に記録する場合は名前を入力してください。",
        };
      }

      records.push({
        user_id: user.id,
        pair_id: null,
        date,
        category: "food",
        name: pairName,
        sub_info: parseOptionalText(formData, "pair_sub_info"),
        rating: parseOptionalRating(formData, "pair_rating"),
        flavor_metrics: parseFlavorMetrics(formData, "pair", "food"),
        comment: parseOptionalText(formData, "pair_comment"),
      });

      const pairId = randomUUID();
      records[0].pair_id = pairId;
      records[1].pair_id = pairId;
    }
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

export async function updateRecordPairing(
  _prevState: RecordActionState | null,
  formData: FormData,
): Promise<RecordActionState> {
  const { supabase } = await requireUser();

  const id = String(formData.get("id") ?? "").trim();
  const pairingAction = String(formData.get("pairing_action") ?? "").trim();

  if (!id) {
    return { error: "記録が指定されていません。" };
  }

  const record = await getRecord(id);

  if (!record) {
    return { error: "記録が見つかりません。" };
  }

  if (pairingAction === "unlink") {
    if (!record.pair_id) {
      return { error: "この記録はペアリングされていません。" };
    }

    const previousPairId = record.pair_id;

    const { error: unlinkError } = await supabase
      .from("records")
      .update({ pair_id: null })
      .eq("id", id);

    if (unlinkError) {
      return { error: "ペアの解除に失敗しました。" };
    }

    try {
      await clearOrphanedPair(supabase, previousPairId);
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "ペアの解除に失敗しました。",
      };
    }

    revalidatePath("/records");
    revalidatePath(`/records/${id}/edit`);
    return {};
  }

  if (pairingAction === "link") {
    const partnerId = String(formData.get("partner_id") ?? "").trim();

    if (!partnerId) {
      return { error: "ペアにする記録を選択してください。" };
    }

    const partner = await getRecord(partnerId);

    if (!partner) {
      return { error: "ペアにする記録が見つかりません。" };
    }

    if (!isOppositeRecordType(record, partner)) {
      return { error: "お酒とおつまみのみペアにできます。" };
    }

    const pairId = record.pair_id ?? partner.pair_id ?? randomUUID();

    const { error: linkError } = await supabase
      .from("records")
      .update({ pair_id: pairId })
      .in("id", [record.id, partner.id]);

    if (linkError) {
      return { error: "ペアの設定に失敗しました。" };
    }

    revalidatePath("/records");
    revalidatePath(`/records/${id}/edit`);
    return {};
  }

  return { error: "操作が不正です。" };
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

  const previousPairId = record.pair_id;

  const { error } = await supabase.from("records").delete().eq("id", id);

  if (error) {
    throw new Error("記録の削除に失敗しました。");
  }

  if (previousPairId) {
    try {
      await clearOrphanedPair(supabase, previousPairId);
    } catch (pairError) {
      throw new Error(
        pairError instanceof Error
          ? pairError.message
          : "ペアの解除に失敗しました。",
      );
    }
  }

  revalidatePath("/records");
}
