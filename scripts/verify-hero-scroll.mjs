/**
 * Headless scroll verification for ghost-pizza fix.
 * Run: node scripts/verify-hero-scroll.mjs
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3000";

async function heroState(page) {
  return page.evaluate(() => {
    const sections = document.querySelectorAll("[data-pizza-section='hero']");
    const hero = sections[0];
    const canvas = hero?.querySelector("canvas");
    const pinSpacer = hero?.closest(".pin-spacer") ?? hero?.parentElement;
    const story = document.querySelector("[data-pizza-section='story']");
    const storyRect = story?.getBoundingClientRect();
    const canvasStyle = canvas ? getComputedStyle(canvas) : null;
    return {
      heroCount: sections.length,
      canvasOpacity: canvasStyle?.opacity ?? null,
      canvasVisibility: canvasStyle?.visibility ?? null,
      pinSpacerHeight: pinSpacer?.style?.height ?? null,
      storyTop: storyRect ? Math.round(storyRect.top) : null,
      scrollY: Math.round(window.scrollY),
    };
  });
}

async function waitForHeroLoaded(page) {
  await page.waitForFunction(
    () => {
      const hero = document.querySelector("[data-pizza-section='hero'] canvas");
      if (!hero) return false;
      const loading = document.querySelector(".fixed.inset-0.z-50");
      const loadingOpacity = loading ? getComputedStyle(loading).opacity : "0";
      return loadingOpacity === "0" || parseFloat(loadingOpacity) < 0.1;
    },
    { timeout: 30000 }
  );
  await page.waitForTimeout(1500);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 824 } });

try {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await waitForHeroLoaded(page);

  const top = await heroState(page);
  console.log("STEP 1 — Top:", JSON.stringify(top, null, 2));

  if (top.heroCount !== 1) throw new Error(`Expected 1 hero section, got ${top.heroCount}`);
  if (parseFloat(top.canvasOpacity) < 0.5) throw new Error("Hero canvas not visible at top");

  // Scroll into Born From Fire (past hero pin)
  await page.evaluate(() => {
    const story = document.querySelector("[data-pizza-section='story']");
    if (story) story.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(1200);

  const fire = await heroState(page);
  console.log("STEP 2 — Born From Fire:", JSON.stringify(fire, null, 2));

  if (parseFloat(fire.canvasOpacity) > 0.05) {
    throw new Error(`Ghost pizza: canvas opacity ${fire.canvasOpacity} at Fire chapter`);
  }

  // Continue through menu sections
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.55));
  await page.waitForTimeout(800);
  const mid = await heroState(page);
  console.log("STEP 3 — Mid page:", JSON.stringify(mid, null, 2));

  if (parseFloat(mid.canvasOpacity) > 0.05) {
    throw new Error(`Ghost pizza mid-page: canvas opacity ${mid.canvasOpacity}`);
  }

  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);

  const restored = await heroState(page);
  console.log("STEP 4 — Back to top:", JSON.stringify(restored, null, 2));

  if (parseFloat(restored.canvasOpacity) < 0.5) {
    throw new Error(`Hero not restored on scroll-up: opacity ${restored.canvasOpacity}`);
  }

  console.log("\n✓ All scroll verification checks passed");
} catch (err) {
  console.error("\n✗ Verification failed:", err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
