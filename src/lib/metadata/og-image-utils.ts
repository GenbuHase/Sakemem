const OG_AVATAR_SIZE = 120;

/** Symbols outside Noto Sans JP that make Satori fetch fallback fonts (often 400). */
const OG_UNSUPPORTED_SYMBOL_RANGES: ReadonlyArray<[number, number]> = [
  [0x2190, 0x21ff],
  [0x2500, 0x257f],
];

export function sanitizeOgText(text: string): string {
  return [...text]
    .filter((char) => {
      const codePoint = char.codePointAt(0);
      if (codePoint === undefined) {
        return false;
      }
      if (codePoint > 0xffff) {
        return false;
      }
      return !OG_UNSUPPORTED_SYMBOL_RANGES.some(
        ([start, end]) => codePoint >= start && codePoint <= end,
      );
    })
    .join("");
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
