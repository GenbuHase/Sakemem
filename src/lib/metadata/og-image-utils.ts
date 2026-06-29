const OG_AVATAR_SIZE = 120;

/** Matches profile bio `maxLength` in profile-settings-form. */
export const OG_BIO_MAX_LENGTH = 200;

/** Fits within the 1200x630 profile OG layout below the header. */
export const OG_BIO_MAX_LINES = 5;
/** Full-width character units per line (1200px canvas, 64px padding, 28px font). */
export const OG_BIO_MAX_WIDTH_UNITS = 36;

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

function estimateCharWidthUnits(char: string): number {
  const code = char.codePointAt(0);
  if (code === undefined) {
    return 0;
  }

  if (
    (code >= 0x20 && code <= 0x7e) ||
    char === "'" ||
    char === "."
  ) {
    return 0.52;
  }

  return 1;
}

export function estimateOgTextWidthUnits(text: string): number {
  return [...text].reduce(
    (sum, char) => sum + estimateCharWidthUnits(char),
    0,
  );
}

function findOgLineBreakIndex(text: string, maxUnits: number): number {
  if (estimateOgTextWidthUnits(text) <= maxUnits) {
    return text.length;
  }

  let units = 0;
  for (let index = 0; index < text.length; index++) {
    units += estimateCharWidthUnits(text[index]);
    if (units <= maxUnits) {
      continue;
    }

    const minBreak = Math.max(1, Math.floor(index * 0.4));
    for (let breakAt = index; breakAt > minBreak; breakAt--) {
      const char = text[breakAt - 1];
      if (
        char === " " ||
        char === "・" ||
        char === "、" ||
        char === "→" ||
        char === "("
      ) {
        return breakAt;
      }
    }

    return index;
  }

  return text.length;
}

const OG_BIO_LINE_PREFIX_PATTERN = /^([┆┊│┃|])\s*/u;

export function splitOgBioLineSegments(line: string): string[] {
  const segments: string[] = [];
  let rest = line;

  const prefixMatch = rest.match(OG_BIO_LINE_PREFIX_PATTERN);
  if (prefixMatch) {
    segments.push(prefixMatch[1]);
    rest = rest.slice(prefixMatch[0].length);
  }

  for (const token of rest.match(/[^\s]+/gu) ?? []) {
    segments.push(token);
  }

  return segments.length > 0 ? segments : [line];
}

function truncateOgLineToWidthUnits(text: string, maxUnits: number): string {
  if (estimateOgTextWidthUnits(text) <= maxUnits) {
    return text;
  }

  const ellipsisUnits = estimateOgTextWidthUnits(OG_ELLIPSIS);
  let units = 0;
  let cutIndex = 0;

  for (let index = 0; index < text.length; index++) {
    const charUnits = estimateCharWidthUnits(text[index]);
    if (units + charUnits + ellipsisUnits > maxUnits) {
      break;
    }
    units += charUnits;
    cutIndex = index + 1;
  }

  return `${text.slice(0, cutIndex)}${OG_ELLIPSIS}`;
}

export function splitOgBioLines(text: string): string[] {
  const truncated = truncateOgText(text, OG_BIO_MAX_LENGTH);
  const lines: string[] = [];
  let hasOverflow = false;

  for (const paragraph of truncated.split("\n")) {
    if (!paragraph) {
      continue;
    }

    let remaining = paragraph;
    while (remaining.length > 0) {
      if (lines.length >= OG_BIO_MAX_LINES) {
        hasOverflow = true;
        break;
      }

      const breakAt = findOgLineBreakIndex(remaining, OG_BIO_MAX_WIDTH_UNITS);
      lines.push(remaining.slice(0, breakAt).trimEnd());
      remaining = remaining.slice(breakAt).trimStart();
    }

    if (hasOverflow) {
      break;
    }
  }

  if (hasOverflow && lines.length > 0) {
    const lastIndex = lines.length - 1;
    const lastLine = lines[lastIndex];
    if (!lastLine.endsWith(OG_ELLIPSIS)) {
      lines[lastIndex] = truncateOgLineToWidthUnits(
        `${lastLine}${OG_ELLIPSIS}`,
        OG_BIO_MAX_WIDTH_UNITS,
      );
    }
  }

  return lines;
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
