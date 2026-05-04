import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, "..", "public", "icons");

await mkdir(iconsDir, { recursive: true });

const bg = { r: 15, g: 23, b: 42, alpha: 1 };

await sharp({
  create: { width: 192, height: 192, channels: 4, background: bg },
})
  .png()
  .toFile(path.join(iconsDir, "icon-192.png"));

await sharp({
  create: { width: 512, height: 512, channels: 4, background: bg },
})
  .png()
  .toFile(path.join(iconsDir, "icon-512-maskable.png"));

console.log("Wrote PWA icons to", iconsDir);
