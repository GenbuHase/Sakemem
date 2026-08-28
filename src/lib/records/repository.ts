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
export const RECORDS_PAGE_SIZE = 50;

export type RecordsCursor = Pick<
  SakememRecord,
  "date" | "created_at" | "id"
>;

export type RecordsPage = {
  records: SakememRecord[];
  nextCursor: RecordsCursor | null;
  hasMore: boolean;
};

export function serializeRecordsCursor(cursor: RecordsCursor): string {
  return `${cursor.date}|${cursor.created_at}|${cursor.id}`;
}

export function getRecordsCursor(
  record: SakememRecord,
): RecordsCursor {
  return {
    date: record.date,
    created_at: record.created_at,
    id: record.id,
  };
}

export async function fetchRecordsPage(
  supabase: SupabaseClient,
  {
    cursor,
    limit = RECORDS_PAGE_SIZE,
  }: {
    cursor?: RecordsCursor | null;
    limit?: number;
  } = {},
): Promise<RecordsPage> {
  const pageSize = Math.max(1, Math.min(limit, RECORDS_PAGE_SIZE));
  let query = supabase
    .from(RECORDS_TABLE)
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(pageSize + 1);

  if (cursor) {
    query = query.or(
      [
        `date.lt.${cursor.date}`,
        `and(date.eq.${cursor.date},created_at.lt.${cursor.created_at})`,
        `and(date.eq.${cursor.date},created_at.eq.${cursor.created_at},id.lt.${cursor.id})`,
      ].join(","),
    );
  }

  const { data, error } = await query;
  if (error) {
    throw new Error("記録の取得に失敗しました。");
  }

  const page = (data ?? []) as SakememRecord[];
  const baseRecords = page.slice(0, pageSize);
  const pairIds = [
    ...new Set(
      baseRecords
        .map((record) => record.pair_id)
        .filter((pairId): pairId is string => pairId !== null),
    ),
  ];

  const pairedRecords =
    pairIds.length === 0
      ? []
      : await fetchRecordsByPairIds(supabase, pairIds);

  return {
    records: mergeRecords(baseRecords, pairedRecords),
    nextCursor: page.length > pageSize
      ? getRecordsCursor(baseRecords.at(-1)!)
      : null,
    hasMore: page.length > pageSize,
  };
}

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

export async function fetchRecordsByPairIds(
  supabase: SupabaseClient,
  pairIds: string[],
): Promise<SakememRecord[]> {
  if (pairIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from(RECORDS_TABLE)
    .select("*")
    .in("pair_id", pairIds);

  if (error) {
    throw new Error("ペア情報の取得に失敗しました。");
  }

  return (data ?? []) as SakememRecord[];
}

export async function fetchUnpairedOppositeRecords(
  supabase: SupabaseClient,
  category: RecordCategory,
  limit = 100,
): Promise<SakememRecord[]> {
  const query = supabase
    .from(RECORDS_TABLE)
    .select("*")
    .is("pair_id", null)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(Math.max(1, Math.min(limit, 100)));
  const { data, error } = await (category === "food"
    ? query.neq("category", "food")
    : query.eq("category", "food"));

  if (error) {
    throw new Error("ペア候補の取得に失敗しました。");
  }

  return (data ?? []) as SakememRecord[];
}

function mergeRecords(
  ...recordGroups: SakememRecord[][]
): SakememRecord[] {
  const byId = new Map<string, SakememRecord>();
  recordGroups.flat().forEach((record) => byId.set(record.id, record));
  return Array.from(byId.values()).toSorted(
    (a, b) =>
      b.date.localeCompare(a.date) ||
      b.created_at.localeCompare(a.created_at) ||
      b.id.localeCompare(a.id),
  );
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
