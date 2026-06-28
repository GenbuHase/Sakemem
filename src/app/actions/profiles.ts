"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import {
  fetchProfileByUserId,
  insertProfile,
  isUsernameAvailable,
  updateProfileByUserId,
} from "@/lib/profiles/repository";
import type { CreateProfileInput, UpdateProfileInput } from "@/lib/profiles/types";
import {
  normalizeUsername,
  validateUsernameFormat,
} from "@/lib/profiles/validate-username";
import { validateAvatarFile } from "@/lib/profiles/upload-avatar";
import { buildProfileUrl } from "@/lib/sharing/build-share-url";

export type ProfileActionState = {
  error?: string;
  success?: string;
  profileUrl?: string;
};

function revalidatePublicProfile(username: string, oldUsername?: string): void {
  revalidatePath(`/@${username}`);
  revalidatePath(`/profile/${username}`);
  if (oldUsername && oldUsername !== username) {
    revalidatePath(`/@${oldUsername}`);
    revalidatePath(`/profile/${oldUsername}`);
  }
}

function parseDisplayName(value: FormDataEntryValue | null): string {
  const trimmed = String(value ?? "").trim();
  if (!trimmed || trimmed.length > 50) {
    throw new Error("表示名は1〜50文字で入力してください。");
  }
  return trimmed;
}

function parseBio(value: FormDataEntryValue | null): string | null {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  if (trimmed.length > 200) {
    throw new Error("自己紹介は200文字以内で入力してください。");
  }
  return trimmed;
}

async function validateUsernameForSave(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  username: string,
  excludeUserId?: string,
): Promise<string> {
  const normalized = normalizeUsername(username);
  const formatError = validateUsernameFormat(normalized);
  if (formatError) {
    throw new Error(formatError);
  }

  const available = await isUsernameAvailable(supabase, normalized, excludeUserId);
  if (!available) {
    throw new Error("このユーザー名は使用されています。");
  }

  return normalized;
}

export async function getMyProfile() {
  const { supabase, user } = await requireUser();
  return fetchProfileByUserId(supabase, user.id);
}

export async function checkUsernameAvailable(
  username: string,
): Promise<{ available: boolean }> {
  const { supabase, user } = await requireUser();
  const normalized = normalizeUsername(username);
  const formatError = validateUsernameFormat(normalized);
  if (formatError) {
    return { available: false };
  }

  const available = await isUsernameAvailable(supabase, normalized, user.id);
  return { available };
}

export async function createProfile(
  _prevState: ProfileActionState | null,
  formData: FormData,
): Promise<ProfileActionState> {
  const { supabase, user } = await requireUser();

  const existing = await fetchProfileByUserId(supabase, user.id);
  if (existing) {
    redirect("/settings/profile");
  }

  try {
    const username = await validateUsernameForSave(
      supabase,
      String(formData.get("username") ?? ""),
    );
    const display_name = parseDisplayName(formData.get("display_name"));
    const bio = parseBio(formData.get("bio"));

    const input: CreateProfileInput = { username, display_name, bio };
    await insertProfile(supabase, user.id, input);

    revalidatePublicProfile(username);
    redirect("/records");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "プロフィールの作成に失敗しました。",
    };
  }
}

export async function updateProfile(
  _prevState: ProfileActionState | null,
  formData: FormData,
): Promise<ProfileActionState> {
  const { supabase, user } = await requireUser();

  const existing = await fetchProfileByUserId(supabase, user.id);
  if (!existing) {
    redirect("/onboarding/profile");
  }

  try {
    const patch: UpdateProfileInput = {};
    const display_name = parseDisplayName(formData.get("display_name"));
    patch.display_name = display_name;
    patch.bio = parseBio(formData.get("bio"));

    const rawUsername = String(formData.get("username") ?? "");
    const newUsername = await validateUsernameForSave(
      supabase,
      rawUsername,
      user.id,
    );
    patch.username = newUsername;

    const avatarUrl = formData.get("avatar_url");
    if (avatarUrl !== null) {
      const url = String(avatarUrl).trim();
      patch.avatar_url = url || null;
    }

    const updated = await updateProfileByUserId(supabase, user.id, patch);
    revalidatePublicProfile(updated.username, existing.username);

    return {
      success: "プロフィールを保存しました。",
      profileUrl: buildProfileUrl(updated.username),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "プロフィールの更新に失敗しました。",
    };
  }
}

export async function uploadAvatar(
  formData: FormData,
): Promise<ProfileActionState & { url?: string }> {
  const { supabase, user } = await requireUser();
  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "画像ファイルを選択してください。" };
  }

  const validation = validateAvatarFile(file);
  if (!validation.ok) {
    return { error: validation.error };
  }

  try {
    const sharp = (await import("sharp")).default;
    const buffer = Buffer.from(await file.arrayBuffer());
    const processed = await sharp(buffer)
      .resize(512, 512, { fit: "cover" })
      .webp({ quality: 85 })
      .toBuffer();

    const objectPath = `${user.id}/${randomUUID()}.webp`;
    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(objectPath, processed, {
        contentType: "image/webp",
        upsert: false,
      });

    if (uploadError) {
      return { error: "画像のアップロードに失敗しました。" };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-images").getPublicUrl(objectPath);

    return { url: publicUrl };
  } catch {
    return { error: "画像の処理に失敗しました。" };
  }
}

export async function removeAvatar(): Promise<ProfileActionState> {
  const { supabase, user } = await requireUser();
  const existing = await fetchProfileByUserId(supabase, user.id);
  if (!existing) {
    return { error: "プロフィールが見つかりません。" };
  }

  await updateProfileByUserId(supabase, user.id, { avatar_url: null });
  revalidatePublicProfile(existing.username);

  return { success: "プロフィール画像を削除しました。" };
}
