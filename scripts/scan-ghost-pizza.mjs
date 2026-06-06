/**
 * Fine-grained scroll scan for ghost pizza visibility.
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3000";

async function canvasProbe(page) {
  return page.evaluate(() => {
    const hero = document.querySelector("[data-pizza-section='hero']");
    const canvas = hero?.querySelector("canvas");
    if (!canvas) return { found: false };

    const style = getComputedStyle(canvas);
    const rect = canvas.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();
    const pinSpacer = hero.closest(".pin-spacer");
    const pinStyle = pinSpacer ? getComputedStyle(pinSpacer) : null;

    let hasPixels = false;
    let maxAlpha = 0;
    const opacity = parseFloat(style.opacity);
    const visible =
      style.visibility !== "hidden" &&
      style.display !== "none" &&
      opacity > 0.02 &&
      rect.width > 0 &&
      rect.height > 0;

    if (visible && canvas.width > 0 && canvas.height > 0) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const sampleW = Math.min(120, canvas.width);
        const sampleH = Math.min(120, canvas.height);
        const data = ctx.getImageData(
          (canvas.width - sampleW) / 2,
          (canvas.height - sampleH) / 2,
          sampleW,
          sampleH
        ).data;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] > 8) {
            hasPixels = true;
            maxAlpha = Math.max(maxAlpha, data[i] / 255);
          }
        }
      }
    }

    const story = document.querySelector("[data-pizza-section='story']");
    const storyRect = story?.getBoundingClientRect();

    return {
      found: true,
      scrollY: Math.round(window.scrollY),
      opacity: style.opacity,
      visibility: style.visibility,
      display: style.display,
      canvasInViewport:
        rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0,
      heroInViewport:
        heroRect.bottom > 0 && heroRect.top < window.innerHeight,
      heroTop: Math.round(heroRect.top),
      storyTop: storyRect ? Math.round(storyRect.top) : null,
      pinPosition: pinStyle?.position ?? null,
      hasPixels,
      maxAlpha: Math.round(maxAlpha * 1000) / 1000,
      visuallyGhost:
        visible &&
        hasPixels &&
        ((rect.bottom > 0 && rect.top < window.innerHeight) || heroInViewport),
    };
  });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 824 } });

try {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);

  const maxScroll = await page.evaluate(() => document.body.scrollHeight);
  const ghosts = [];

  for (let y = 0; y <= maxScroll; y += 40) {
    await page.evaluate((scroll) => window.scrollTo(0, scroll), y);
    await page.waitForTimeout(60);
    const probe = await canvasProbe(page);
    if (probe.visuallyGhost) {
      ghosts.push(probe);
    }
  }

  console.log(`Scanned 0..${maxScroll}px in 40px steps`);
  if (ghosts.length === 0) {
    console.log("✓ No ghost pizza detected outside hero fade range");
  } else {
    console.log(`✗ ${ghosts.length} ghost sample(s):`);
    ghosts.slice(0, 12).forEach((g) => console.log(JSON.stringify(g)));
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
