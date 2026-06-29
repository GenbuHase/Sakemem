const OG_AVATAR_SIZE = 120;

export const OG_ELLIPSIS = "……";

export function sanitizeOgText(text: string): string {
  return [...text]
    .filter((char) => char.codePointAt(0) !== undefined)
    .join("");
}

export function truncateOgText(text: string, max: number): string {
  const sanitized = sanitizeOgText(text);
  if (sanitized.length <= max) {
    return sanitized;
  }
  return `${sanitized.slice(0, max - OG_ELLIPSIS.length)}${OG_ELLIPSIS}`;
}

export async function fetchOgAvatarDataUrl(
  avatarUrl: string | null | undefined,
): Promise<string | null> {
  if (!avatarUrl) {
    return null;
  }

  try {
    const response = await fetch(avatarUrl);
    if (!response.ok) {
      return null;
    }

    const sharp = (await import("sharp")).default;
    const buffer = Buffer.from(await response.arrayBuffer());
    const png = await sharp(buffer)
      .resize(OG_AVATAR_SIZE, OG_AVATAR_SIZE, { fit: "cover" })
      .png()
      .toBuffer();

    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}
