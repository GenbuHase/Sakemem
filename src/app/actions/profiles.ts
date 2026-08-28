"use server";

import { randomUUID } from "crypto";
import { after } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { revalidatePublicProfile } from "@/lib/routing/revalidate-public";
import {
  fetchProfileByUserId,
  insertProfile,
  isUsernameAvailable,
  updateProfileByUserId,
} from "@/lib/profiles/repository";
import type {
  CreateProfileInput,
  Profile,
  UpdateProfileInput,
} from "@/lib/profiles/types";
import {
  normalizeUsername,
  validateUsernameFormat,
} from "@/lib/profiles/validate-username";
import { validateAvatarFile } from "@/lib/profiles/upload-avatar";
import { deleteStoredAvatar } from "@/lib/profiles/delete-avatar-storage";
import { buildProfileUrl } from "@/lib/sharing/build-share-url";

export type ProfileActionState = {
  error?: string;
  success?: string;
  profileUrl?: string;
  username?: string;
  profile?: Profile;
};

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

export async function createProfile(
  _prevState: ProfileActionState | null,
  formData: FormData,
): Promise<ProfileActionState> {
  const { supabase, user } = await requireUser();

  const existing = await fetchProfileByUserId(supabase, user.id);
  if (existing) {
    return { error: "プロフィールはすでに作成されています。" };
  }

  try {
    const username = await validateUsernameForSave(
      supabase,
      String(formData.get("username") ?? ""),
    );
    const display_name = parseDisplayName(formData.get("display_name"));
    const bio = parseBio(formData.get("bio"));

    const avatarUrlRaw = formData.get("avatar_url");
    const avatar_url =
      avatarUrlRaw !== null ? String(avatarUrlRaw).trim() || null : null;

    const input: CreateProfileInput = { username, display_name, bio, avatar_url };
    const profile = await insertProfile(supabase, user.id, input);

    after(() => revalidatePublicProfile(username));
    return {
      success: "プロフィールを作成しました。",
      profile,
      profileUrl: buildProfileUrl(profile.username),
      username: profile.username,
    };
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
    return { error: "プロフィールが見つかりません。" };
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
    if (existing.avatar_url && existing.avatar_url !== updated.avatar_url) {
      await deleteStoredAvatar(supabase, user.id, existing.avatar_url);
    }
    after(() =>
      revalidatePublicProfile(updated.username, existing.username),
    );

    return {
      success: "プロフィールを保存しました。",
      profile: updated,
      profileUrl: buildProfileUrl(updated.username),
      username: updated.username,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "プロフィールの更新に失敗しました。",
    };
  }
}

function getAvatarUploadFile(formData: FormData): File | null {
  const entry = formData.get("avatar");
  if (typeof entry === "string" || !(entry instanceof Blob) || entry.size === 0) {
    return null;
  }

  if (entry instanceof File) {
    return entry;
  }

  const blob: Blob = entry;
  return new File([blob], "avatar", {
    type: blob.type || "application/octet-stream",
  });
}

export async function uploadAvatar(
  formData: FormData,
): Promise<ProfileActionState & { url?: string }> {
  const { supabase, user } = await requireUser();
  const file = getAvatarUploadFile(formData);

  if (!file) {
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
      console.error("uploadAvatar storage error:", uploadError);
      return { error: "画像のアップロードに失敗しました。" };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-images").getPublicUrl(objectPath);

    const existing = await fetchProfileByUserId(supabase, user.id);
    const previousUrlRaw =
      existing?.avatar_url ??
      String(formData.get("previous_avatar_url") ?? "").trim();
    const previousUrl = previousUrlRaw || null;
    let updatedProfile: Profile | undefined;
    if (existing) {
      updatedProfile = await updateProfileByUserId(supabase, user.id, {
        avatar_url: publicUrl,
      });
      after(() => revalidatePublicProfile(existing.username));
    }

    if (previousUrl && previousUrl !== publicUrl) {
      await deleteStoredAvatar(supabase, user.id, previousUrl);
    }

    return { url: publicUrl, profile: updatedProfile };
  } catch (error) {
    console.error("uploadAvatar processing error:", error);
    return { error: "画像の処理に失敗しました。" };
  }
}

export async function removeAvatar(
  currentUrl?: string | null,
): Promise<ProfileActionState> {
  const { supabase, user } = await requireUser();
  const existing = await fetchProfileByUserId(supabase, user.id);
  const urlToDelete = existing?.avatar_url ?? currentUrl ?? null;

  if (!existing && !urlToDelete) {
    return {};
  }

  if (existing) {
    const profile = await updateProfileByUserId(supabase, user.id, {
      avatar_url: null,
    });
    after(() => revalidatePublicProfile(existing.username));
    await deleteStoredAvatar(supabase, user.id, urlToDelete);
    return {
      success: "プロフィール画像を削除しました。",
      profile,
    };
  }

  await deleteStoredAvatar(supabase, user.id, urlToDelete);

  return { success: "プロフィール画像を削除しました。" };
}
