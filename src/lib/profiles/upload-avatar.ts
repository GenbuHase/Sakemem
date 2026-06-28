const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function validateAvatarFile(
  file: File,
): { ok: true } | { ok: false; error: string } {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      ok: false,
      error: "JPEG、PNG、WebP 形式の画像を選んでください。",
    };
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, error: "2 MB 以下の画像を選んでください。" };
  }

  return { ok: true };
}

export { MAX_AVATAR_BYTES, ALLOWED_MIME_TYPES };
