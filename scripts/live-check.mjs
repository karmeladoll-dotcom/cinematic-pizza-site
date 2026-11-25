import { chromium } from "playwright";
import path from "node:path";
const [out, base] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const wait = (p) => p.waitForFunction(() => parseFloat(getComputedStyle(document.querySelector(".fixed.inset-0.z-50")).opacity) < 0.05, null, { timeout: 90000 });
// touch: cursor must not exist visibly
{
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await c.newPage(); await p.goto(base, { waitUntil: "load" }); await wait(p); await p.waitForTimeout(2000);
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight - 2600)); await p.waitForTimeout(1500);
  console.log("touch cursor:", JSON.stringify(await p.evaluate(() => [...document.querySelectorAll(".fx-cursor-el")].map((e) => ({ display: getComputedStyle(e).display, rect: e.getBoundingClientRect().width })))), "hover:none =", await p.evaluate(() => matchMedia("(hover: none)").matches));
  await c.close();
}
{
  const c = await b.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  const p = await c.newPage(); await p.goto(base, { waitUntil: "load" }); await wait(p); await p.waitForTimeout(3000);
  await p.screenshot({ path: path.join(out, "desktop-naslovnica.png") });
  const total = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  await p.evaluate(() => window.scrollTo(0, document.querySelector("#reservation").getBoundingClientRect().top + scrollY - 20)); await p.waitForTimeout(4500);
  await p.screenshot({ path: path.join(out, "desktop-finale.png") });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: path.join(out, "desktop-finale-2.png") });
  console.log("desktop total", total, "video paused:", await p.evaluate(() => document.querySelector("#reservation video").paused));
  await c.close();
}
await b.close();
