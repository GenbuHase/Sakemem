import type { SupabaseClient } from "@supabase/supabase-js";

const PROFILE_IMAGES_BUCKET = "profile-images";

export function parseProfileImageObjectPath(
  publicUrl: string,
): string | null {
  try {
    const url = new URL(publicUrl);
    const marker = `/storage/v1/object/public/${PROFILE_IMAGES_BUCKET}/`;
    const index = url.pathname.indexOf(marker);
    if (index === -1) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

export function isOwnedProfileImagePath(
  userId: string,
  objectPath: string,
): boolean {
  return objectPath.startsWith(`${userId}/`);
}

/** Storage オブジェクトの削除はベストエフォート（失敗しても呼び出し元は続行） */
export async function deleteStoredAvatar(
  supabase: SupabaseClient,
  userId: string,
  avatarUrl: string | null | undefined,
): Promise<void> {
  if (!avatarUrl) {
    return;
  }

  const objectPath = parseProfileImageObjectPath(avatarUrl);
  if (!objectPath || !isOwnedProfileImagePath(userId, objectPath)) {
    return;
  }

  const { error } = await supabase.storage
    .from(PROFILE_IMAGES_BUCKET)
    .remove([objectPath]);

  if (error) {
    console.error("deleteStoredAvatar:", error);
  }
}
