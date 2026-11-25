// node scripts/scroll-series.mjs <outDir> [baseUrl] [stepPx]  -> 01.png .. NN.png at 390x844 (touch)
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
const [outDir, base = "http://localhost:3100", step = "800"] = process.argv.slice(2);
await mkdir(outDir, { recursive: true });
const b = await chromium.launch({ channel: "chrome", headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await c.newPage();
await p.goto(base, { waitUntil: "load" });
await p.waitForFunction(() => parseFloat(getComputedStyle(document.querySelector(".fixed.inset-0.z-50")).opacity) < 0.05, null, { timeout: 90000 });
await p.waitForTimeout(2500);
const total = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
let i = 1;
for (let y = 0; ; y += +step) {
  const yy = Math.min(y, total);
  await p.evaluate((v) => window.scrollTo(0, v), yy);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: path.join(outDir, `${String(i).padStart(2, "0")}.png`) });
  i++;
  if (yy >= total) break;
}
console.log("total", total, "frames", i - 1);
await b.close();
