import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateProfileInput,
  Profile,
  PublicProfile,
  UpdateProfileInput,
} from "./types";

const PROFILES_TABLE = "profiles";

export async function fetchProfileByUserId(
  supabase: SupabaseClient,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("プロフィールの取得に失敗しました。");
  }

  return (data as Profile | null) ?? null;
}

export async function insertProfile(
  supabase: SupabaseClient,
  userId: string,
  input: CreateProfileInput,
): Promise<Profile> {
  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .insert({
      id: userId,
      username: input.username,
      display_name: input.display_name,
      bio: input.bio ?? null,
      avatar_url: input.avatar_url ?? null,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("このユーザー名は使用されています。");
    }
    throw new Error("プロフィールの作成に失敗しました。");
  }

  return data as Profile;
}

export async function updateProfileByUserId(
  supabase: SupabaseClient,
  userId: string,
  patch: UpdateProfileInput,
): Promise<Profile> {
  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("このユーザー名は使用されています。");
    }
    throw new Error("プロフィールの更新に失敗しました。");
  }

  return data as Profile;
}

export async function isUsernameAvailable(
  supabase: SupabaseClient,
  username: string,
  excludeUserId?: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_username_available", {
    p_username: username,
    p_exclude_user_id: excludeUserId ?? null,
  });

  if (error) {
    throw new Error("ユーザー名の確認に失敗しました。");
  }

  return Boolean(data);
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

  const row = (data as PublicProfile[] | null)?.[0];
  return row ?? null;
}
