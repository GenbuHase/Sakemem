import type { SupabaseClient } from "@supabase/supabase-js";
import type { FlavorMetrics, RecordCategory, SakememRecord } from "@/lib/types/record";

import type { RecordVisibility } from "@/lib/types/record";

export type RecordWritePayload = {
  date: string;
  category: RecordCategory;
  name: string;
  producer: string | null;
  style: string | null;
  sub_info: string | null;
  place: string | null;
  rating: number | null;
  flavor_metrics: FlavorMetrics;
  comment: string | null;
  visibility: RecordVisibility;
  hide_place_when_shared: boolean;
};

export type RecordInsert = RecordWritePayload & {
  user_id: string;
  pair_id: string | null;
};

const RECORDS_TABLE = "records";

export async function fetchAllRecords(
  supabase: SupabaseClient,
): Promise<SakememRecord[]> {
  const { data, error } = await supabase
    .from(RECORDS_TABLE)
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("記録の取得に失敗しました。");
  }

  return (data ?? []) as SakememRecord[];
}

export async function fetchRecordById(
  supabase: SupabaseClient,
  id: string,
): Promise<SakememRecord | null> {
  const { data, error } = await supabase
    .from(RECORDS_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("記録の取得に失敗しました。");
  }

  return (data as SakememRecord | null) ?? null;
}

export async function fetchRecordsByPairId(
  supabase: SupabaseClient,
  pairId: string,
): Promise<SakememRecord[]> {
  const { data, error } = await supabase
    .from(RECORDS_TABLE)
    .select("*")
    .eq("pair_id", pairId);

  if (error) {
    throw new Error("ペア情報の取得に失敗しました。");
  }

  return (data ?? []) as SakememRecord[];
}

export async function insertRecords(
  supabase: SupabaseClient,
  records: RecordInsert[],
): Promise<SakememRecord[]> {
  const { data, error } = await supabase
    .from(RECORDS_TABLE)
    .insert(records)
    .select("*");

  if (error) {
    throw new Error("記録の保存に失敗しました。");
  }

  return (data ?? []) as SakememRecord[];
}

export async function updateRecordById(
  supabase: SupabaseClient,
  id: string,
  patch: RecordWritePayload,
): Promise<SakememRecord> {
  const { data, error } = await supabase
    .from(RECORDS_TABLE)
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error("記録の更新に失敗しました。");
  }

  return data as SakememRecord;
}

export async function deleteRecordById(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from(RECORDS_TABLE).delete().eq("id", id);

  if (error) {
    throw new Error("記録の削除に失敗しました。");
  }
}

export async function setRecordsPairId(
  supabase: SupabaseClient,
  ids: string[],
  pairId: string | null,
): Promise<void> {
  const { error } = await supabase
    .from(RECORDS_TABLE)
    .update({ pair_id: pairId })
    .in("id", ids);

  if (error) {
    throw new Error("ペアの更新に失敗しました。");
  }
}

export async function mergePairIds(
  supabase: SupabaseClient,
  fromPairId: string,
  toPairId: string,
): Promise<void> {
  const { error } = await supabase
    .from(RECORDS_TABLE)
    .update({ pair_id: toPairId })
    .eq("pair_id", fromPairId);

  if (error) {
    throw new Error("ペアの統合に失敗しました。");
  }
}

/**
 * 指定 pair_id を持つレコードが 1 件以下になった場合に pair_id を解除する。
 * （ペアの片方が削除/解除されると残った 1 件は単独記録に戻す仕様）
 */
export async function clearOrphanedPair(
  supabase: SupabaseClient,
  pairId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from(RECORDS_TABLE)
    .select("id")
    .eq("pair_id", pairId);

  if (error) {
    throw new Error("ペア情報の取得に失敗しました。");
  }

  if ((data ?? []).length > 1) {
    return;
  }

  const { error: updateError } = await supabase
    .from(RECORDS_TABLE)
    .update({ pair_id: null })
    .eq("pair_id", pairId);

  if (updateError) {
    throw new Error("ペアの解除に失敗しました。");
  }
}
