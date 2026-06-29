import type { ImageResponseOptions } from "@vercel/og";
import { readFile } from "fs/promises";
import path from "path";

export const OG_FONT_FAMILY = "NotoSansJP, NotoSansSymbols2, NotoSansMono";

const OG_FONT_CDN = {
  jpRegular: "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@latest/japanese-400-normal.woff",
  jpBold: "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@latest/japanese-700-normal.woff",
  symbols2: "https://cdn.jsdelivr.net/gh/notofonts/noto-fonts@main/hinted/ttf/NotoSansSymbols2/NotoSansSymbols2-Regular.ttf",
  mono: "https://cdn.jsdelivr.net/gh/notofonts/noto-fonts@main/hinted/ttf/NotoSansMono/NotoSansMono-Regular.ttf",
} as const;

export type OgFontData = {
  regular: ArrayBuffer;
  bold: ArrayBuffer;
  symbols: ArrayBuffer;
  mono: ArrayBuffer;
};

function toArrayBuffer(data: Buffer): ArrayBuffer {
  return data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  ) as ArrayBuffer;
}

export function buildOgImageOptions(
  fonts: OgFontData,
  size: { width: number; height: number },
): Pick<ImageResponseOptions, "width" | "height" | "emoji" | "fonts"> {
  return {
    ...size,
    emoji: "twemoji" as const,
    fonts: [
      {
        name: "NotoSansJP",
        data: fonts.regular,
        weight: 400,
        style: "normal",
      },
      {
        name: "NotoSansJP",
        data: fonts.bold,
        weight: 700,
        style: "normal",
      },
      {
        name: "NotoSansSymbols2",
        data: fonts.symbols,
        weight: 400,
        style: "normal",
      },
      {
        name: "NotoSansMono",
        data: fonts.mono,
        weight: 400,
        style: "normal",
      },
    ],
  };
}

async function loadFontFile(
  fontsDir: string,
  localFilenames: readonly string[],
  cdnUrl: string,
): Promise<ArrayBuffer> {
  for (const filename of localFilenames) {
    try {
      const data = await readFile(path.join(fontsDir, filename));
      return toArrayBuffer(data);
    } catch {
      // try next local filename
    }
  }

  const response = await fetch(cdnUrl);
  if (!response.ok) {
    throw new Error(`Failed to load OG font: ${cdnUrl}`);
  }
  return response.arrayBuffer();
}

export async function loadOgFonts(): Promise<OgFontData> {
  const fontsDir = path.join(process.cwd(), "public", "fonts");
  const [regular, bold, symbols, mono] = await Promise.all([
    loadFontFile(fontsDir, ["NotoSansJP-Regular.woff"], OG_FONT_CDN.jpRegular),
    loadFontFile(fontsDir, ["NotoSansJP-Bold.woff"], OG_FONT_CDN.jpBold),
    loadFontFile(
      fontsDir,
      ["NotoSansSymbols2-Regular.ttf", "NotoSansSymbols2-Regular.woff"],
      OG_FONT_CDN.symbols2,
    ),
    loadFontFile(
      fontsDir,
      ["NotoSansMono-Regular.ttf", "NotoSansMono-Regular.woff"],
      OG_FONT_CDN.mono,
    ),
  ]);

  return { regular, bold, symbols, mono };
}
