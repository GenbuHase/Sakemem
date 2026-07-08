import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "public", "icons");
const appDir = join(root, "src", "app");

const outputs = [
  { input: "icon.svg", output: "icon-192x192.png", size: 192 },
  { input: "icon.svg", output: "icon-512x512.png", size: 512 },
  { input: "icon-maskable.svg", output: "icon-maskable-512x512.png", size: 512 },
  { input: "icon.svg", output: "apple-touch-icon.png", size: 180 },
];

for (const { input, output, size } of outputs) {
  const svg = await readFile(join(iconsDir, input));
  const png = await sharp(svg).resize(size, size).png().toBuffer();
  await writeFile(join(iconsDir, output), png);
}

const icon32 = await sharp(await readFile(join(iconsDir, "icon.svg")))
  .resize(32, 32)
  .png()
  .toBuffer();

await writeFile(join(appDir, "icon.png"), icon32);
await writeFile(join(appDir, "apple-icon.png"), await readFile(join(iconsDir, "apple-touch-icon.png")));

console.log("Generated PWA icons.");
