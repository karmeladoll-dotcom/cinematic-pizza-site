// Makes a still poster (1280w) + a tiny blurred backdrop (160w) for each narrative video.
// Usage: node scripts/make-posters.mjs      (needs ffmpeg on PATH; originals untouched)
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const NAMES = {
  oven: 0.6,
  "source-mozzarella": 1.2,
  "source-basil": 0.7,
  "source-tomato": 0.9,
  "result-focaccia": 0.9,
  "result-pizza-pull": 0.8,
};
const out = path.resolve("public/posters");
await mkdir(out, { recursive: true });

for (const [name, t] of Object.entries(NAMES)) {
  const tmp = path.join(tmpdir(), `poster-${name}.png`);
  execFileSync("ffmpeg", ["-y", "-v", "error", "-ss", String(t), "-i", `public/videos/${name}.mp4`, "-frames:v", "1", tmp]);
  const buf = await readFile(tmp);
  await sharp(buf).resize(1280).webp({ quality: 78 }).toFile(path.join(out, `${name}.webp`));
  await sharp(buf).resize(160).blur(7).modulate({ brightness: 0.7 }).webp({ quality: 70 }).toFile(path.join(out, `${name}-bg.webp`));
  await unlink(tmp);
  console.log("ok", name);
}
