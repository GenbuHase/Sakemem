import type { SupabaseClient } from "@supabase/supabase-js";
import type { SakememRecord } from "@/lib/types/record";
import type { PublicProfile } from "@/lib/profiles/types";
import {
  maskRecordPlace,
  sharedRecordToSakememRecord,
  type SharedRecord,
} from "./mask-record";

export async function fetchSharedRecord(
  supabase: SupabaseClient,
  username: string,
  recordId: string,
): Promise<SharedRecord | null> {
  const { data, error } = await supabase.rpc("get_shared_record", {
    p_username: username,
    p_record_id: recordId,
  });

  if (error) {
    throw new Error("共有記録の取得に失敗しました。");
  }

  const row = (data as SharedRecord[] | null)?.[0];
  return row ? maskRecordPlace(row) : null;
}

export async function fetchSharedPairRecords(
  supabase: SupabaseClient,
  username: string,
  pairId: string,
  excludeId: string,
): Promise<SakememRecord[]> {
  const { data, error } = await supabase.rpc("get_shared_pair_records", {
    p_username: username,
    p_pair_id: pairId,
    p_exclude_id: excludeId,
  });

  if (error) {
    throw new Error("ペア記録の取得に失敗しました。");
  }

  return ((data as Omit<SharedRecord, "profile_username" | "profile_display_name" | "profile_bio" | "profile_avatar_url">[]) ?? []).map(
    (row) => sharedRecordToSakememRecord(maskRecordPlace(row) as SharedRecord),
  );
}

export async function fetchPublicProfile(
  supabase: SupabaseClient,
  username: string,
): Promise<PublicProfile | null> {
  const { data, error } = await supabase.rpc("get_public_profile", {
    p_username: username,
  });

  if (error) {
    throw new Error("公開プロフィールの取得に失敗しました。");
  }

  return (data as PublicProfile[] | null)?.[0] ?? null;
}

export async function fetchPublicProfileRecords(
  supabase: SupabaseClient,
  username: string,
  limit = 50,
): Promise<SakememRecord[]> {
  const { data, error } = await supabase.rpc("get_public_profile_records", {
    p_username: username,
    p_limit: limit,
    p_offset: 0,
  });

  if (error) {
    throw new Error("公開記録の取得に失敗しました。");
  }

  return ((data as SakememRecord[]) ?? []).map((record) =>
    maskRecordPlace(record),
  );
}
