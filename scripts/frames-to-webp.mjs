// Converts the 25 hero frames (PNG) to WebP for much faster first load.
// Usage: node scripts/frames-to-webp.mjs   (originals in public/frames are kept)
import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

const SRC = path.resolve("public/frames");
const DST = path.resolve("public/frames-webp");
const COUNT = 25;

await mkdir(DST, { recursive: true });
let before = 0;
let after = 0;
for (let i = 1; i <= COUNT; i++) {
  const name = `ezgif-frame-${String(i).padStart(3, "0")}`;
  const src = path.join(SRC, `${name}.png`);
  const dst = path.join(DST, `${name}.webp`);
  await sharp(src).webp({ quality: 92, effort: 6, smartSubsample: false }).toFile(dst);
  before += (await stat(src)).size;
  after += (await stat(dst)).size;
}
console.log(
  `PNG ${(before / 1048576).toFixed(1)} MB -> WebP ${(after / 1048576).toFixed(1)} MB (${COUNT} frames)`
);
