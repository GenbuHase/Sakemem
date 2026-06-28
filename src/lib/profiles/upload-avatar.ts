const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const EXTENSION_MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export function resolveAvatarMimeType(file: Pick<File, "name" | "type">): string {
  if (file.type && ALLOWED_MIME_TYPES.has(file.type)) {
    return file.type;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MIME_TYPES[extension] ?? file.type;
}

export function validateAvatarFile(
  file: Pick<File, "name" | "size" | "type">,
): { ok: true } | { ok: false; error: string } {
  const mimeType = resolveAvatarMimeType(file);
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
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
