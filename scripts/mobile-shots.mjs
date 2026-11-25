/**
 * Screenshot sweep for mobile/desktop comparison.
 * Usage: node scripts/mobile-shots.mjs <outDir> <prefix> [port]
 * Uses system Chrome (channel "chrome") because bundled Chromium has no H.264.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const [outDir, prefix, port = "3100"] = process.argv.slice(2);
const BASE = `http://localhost:${port}`;
await mkdir(outDir, { recursive: true });

const PROFILES = {
  m390: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  m360: { viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  d1600: { viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
};

const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });

for (const [name, opts] of Object.entries(PROFILES)) {
  if (prefix && process.env.ONLY && process.env.ONLY !== name) continue;
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForFunction(() => {
    const l = document.querySelector(".fixed.inset-0.z-50");
    return !l || parseFloat(getComputedStyle(l).opacity) < 0.05;
  }, { timeout: 60000 });
  await page.waitForTimeout(2500);

  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const steps = Number(process.env.STEPS || 28);
  const shot = async (label) =>
    page.screenshot({ path: path.join(outDir, `${prefix}-${name}-${label}.png`) });

  console.log(name, "total scroll", total);
  for (let i = 0; i <= steps; i++) {
    const y = Math.round((total * i) / steps);
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(1400);
    await shot(`${String(i).padStart(2, "0")}-y${y}`);
  }
  // cursor probe: where is the fork/knife element and is it visible?
  const cursor = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("svg[width='30'][height='71']").forEach((s) => {
      const r = s.getBoundingClientRect();
      const cs = getComputedStyle(s);
      let el = s, vis = true;
      while (el && el !== document.body) {
        const c = getComputedStyle(el);
        if (c.visibility === "hidden" || c.display === "none" || parseFloat(c.opacity) === 0) vis = false;
        el = el.parentElement;
      }
      out.push({ x: Math.round(r.x), y: Math.round(r.y), visible: vis, vis: cs.visibility });
    });
    return out;
  });
  console.log(name, "cursor svgs", JSON.stringify(cursor), "errors", errors.length ? errors : "none");
  await ctx.close();
}
await browser.close();
