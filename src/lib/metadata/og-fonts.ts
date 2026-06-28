import { readFile } from "fs/promises";
import path from "path";

export async function loadOgFonts(): Promise<{
  regular: ArrayBuffer;
  bold: ArrayBuffer;
}> {
  const fontsDir = path.join(process.cwd(), "public", "fonts");

  try {
    const [regular, bold] = await Promise.all([
      readFile(path.join(fontsDir, "NotoSansJP-Regular.woff")),
      readFile(path.join(fontsDir, "NotoSansJP-Bold.woff")),
    ]);
    return {
      regular: regular.buffer.slice(
        regular.byteOffset,
        regular.byteOffset + regular.byteLength,
      ),
      bold: bold.buffer.slice(
        bold.byteOffset,
        bold.byteOffset + bold.byteLength,
      ),
    };
  } catch {
    const [regularRes, boldRes] = await Promise.all([
      fetch(
        "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@latest/japanese-400-normal.woff",
      ),
      fetch(
        "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@latest/japanese-700-normal.woff",
      ),
    ]);

    return {
      regular: await regularRes.arrayBuffer(),
      bold: await boldRes.arrayBuffer(),
    };
  }
}
