// node scripts/contact-sheet.mjs <dir> <filePrefix> <out.png> [cols] [thumbW]
import sharp from "sharp";
import { readdir } from "node:fs/promises";
import path from "node:path";

const [dir, pre, out, colsArg = "7", wArg = "190"] = process.argv.slice(2);
const cols = Number(colsArg), tw = Number(wArg);
const files = (await readdir(dir)).filter((f) => f.startsWith(pre) && f.endsWith(".png")).sort();
const meta = await sharp(path.join(dir, files[0])).metadata();
const th = Math.round((tw * meta.height) / meta.width);
const rows = Math.ceil(files.length / cols);
const comps = [];
for (let i = 0; i < files.length; i++) {
  const buf = await sharp(path.join(dir, files[i])).resize(tw, th).toBuffer();
  comps.push({ input: buf, left: (i % cols) * (tw + 6), top: Math.floor(i / cols) * (th + 6) });
}
await sharp({ create: { width: cols * (tw + 6), height: rows * (th + 6), channels: 3, background: "#555" } })
  .composite(comps).png().toFile(out);
console.log(files.length, "frames ->", out);
