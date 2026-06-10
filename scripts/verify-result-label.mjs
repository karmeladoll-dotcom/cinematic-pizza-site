/**
 * Verifies that ResultChapterSection's last label ("La Tavola") fades out
 * gracefully before the chapter exits, rather than snapping to 0 via hideChapter.
 *
 * Run: node scripts/verify-result-label.mjs
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3000";

async function waitForPageReady(page) {
  await page.waitForFunction(
    () => {
      const loading = document.querySelector(".fixed.inset-0.z-50");
      const op = loading ? parseFloat(getComputedStyle(loading).opacity) : 0;
      return op < 0.1;
    },
    { timeout: 30000 }
  );
  await page.waitForTimeout(2000);
}

async function scrollTo(page, y, settleMs = 900) {
  await page.evaluate((sy) => window.scrollTo(0, sy), y);
  await page.waitForTimeout(settleMs);
}

/** Return opacity of each label <p> inside [data-pizza-section='result']. */
async function resultLabelState(page) {
  return page.evaluate(() => {
    const section = document.querySelector("[data-pizza-section='result']");
    if (!section) return { found: false };

    // The label container is the child div with zIndex=6.
    // Inside it are <p> elements — one per slide — controlled by GSAP autoAlpha.
    const container = Array.from(section.children).find(
      (el) => getComputedStyle(el).zIndex === "6"
    );

    const labelPs = container ? Array.from(container.querySelectorAll("p")) : [];

    const labels = labelPs.map((p) => {
      const cs = getComputedStyle(p);
      return {
        text: p.textContent?.trim() ?? "",
        opacity: parseFloat(cs.opacity),
        visibility: cs.visibility,
        inlineOpacity: p.style.opacity,
      };
    });

    return {
      found: true,
      scrollY: Math.round(window.scrollY),
      pinned: getComputedStyle(section).position === "fixed",
      containerOpacity: container ? parseFloat(getComputedStyle(container).opacity) : null,
      labels,
    };
  });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

let passed = true;

try {
  console.log("Loading page…");
  await page.goto(BASE, { waitUntil: "networkidle" });
  await waitForPageReady(page);

  // ── Step 1: find the Result section pin window ──────────────────────────
  console.log("\nScanning for result pin window…");
  let resultPin = null;

  for (let y = 0; y <= 8000; y += 80) {
    await page.evaluate((sy) => window.scrollTo(0, sy), y);
    await page.waitForTimeout(30);
    const pinned = await page.evaluate(() => {
      const s = document.querySelector("[data-pizza-section='result']");
      return s ? getComputedStyle(s).position === "fixed" : false;
    });
    if (pinned && !resultPin) resultPin = { start: y };
    if (!pinned && resultPin && !resultPin.end) resultPin.end = y;
    if (resultPin?.end) break;
  }

  if (!resultPin) {
    console.error("✗ Could not locate result pin window");
    process.exitCode = 1;
    process.exit(1);
  }

  console.log(`Result pin window: ${resultPin.start}–${resultPin.end}`);
  const pinLen = resultPin.end - resultPin.start;

  // ── Step 2: probe label opacity at several points near the exit ─────────
  const probePoints = [
    { pct: 0.30, label: "30%" },
    { pct: 0.45, label: "45%" },
    { pct: 0.55, label: "55%" },
    { pct: 0.65, label: "65%" },
    { pct: 0.75, label: "75%" },
    { pct: 0.85, label: "85%" },
    { pct: 0.90, label: "90%" },
    { pct: 0.94, label: "94%" },
    { pct: 0.97, label: "97%" },
    { pct: 0.995, label: "99.5% — end of pin" },
  ];

  const readings = [];

  for (const { pct, label } of probePoints) {
    const y = Math.round(resultPin.start + pinLen * pct);
    await scrollTo(page, y, 700);
    const state = await resultLabelState(page);

    // Last label = last <p> in the label container
    const lastLabel = state.labels?.at(-1) ?? null;
    const labelOp = lastLabel?.opacity ?? null;

    console.log(
      `\n  y=${y} (${Math.round(pct * 100)}%) — ${label}` +
      `\n    pinned=${state.pinned}`
    );
    (state.labels ?? []).forEach((lbl, i) =>
      console.log(`    label[${i}] "${lbl.text}" opacity=${lbl.opacity} vis=${lbl.visibility}`)
    );

    readings.push({ pct, y, labelOp });
  }

  // ── Step 3: assertions ──────────────────────────────────────────────────
  console.log("\n── Assertions ──");

  // La Tavola should be fully visible mid-chapter
  const r65 = readings.find((r) => r.pct === 0.65);
  if (r65?.labelOp !== null && r65.labelOp < 0.8) {
    console.error(`✗ La Tavola not visible at 65%: opacity=${r65.labelOp}`);
    passed = false;
  } else {
    console.log(`✓ La Tavola visible at 65%: opacity=${r65?.labelOp}`);
  }

  // Smooth fade: opacity decreasing between 75% and 90%
  const r75 = readings.find((r) => r.pct === 0.75);
  const r85 = readings.find((r) => r.pct === 0.85);
  const r90 = readings.find((r) => r.pct === 0.90);

  if (r85 && r75 && r85.labelOp >= r75.labelOp) {
    console.warn(`⚠ Label opacity not decreasing 75→85%: ${r75.labelOp} → ${r85.labelOp}`);
  } else {
    console.log(`✓ Label fading smoothly 75→85%: ${r75?.labelOp} → ${r85?.labelOp}`);
  }

  if (r90?.labelOp !== null && r90.labelOp > 0.15) {
    console.error(`✗ La Tavola not faded by 90%: opacity=${r90.labelOp}`);
    passed = false;
  } else {
    console.log(`✓ La Tavola faded by 90%: opacity=${r90?.labelOp}`);
  }

  const r99 = readings.find((r) => r.pct === 0.995);
  if (r99?.labelOp !== null && r99.labelOp > 0.15) {
    console.error(`✗ La Tavola not faded at pin end: opacity=${r99.labelOp}`);
    passed = false;
  } else {
    console.log(`✓ La Tavola faded at pin end: opacity=${r99?.labelOp}`);
  }

  if (passed) {
    console.log("\n✓ Result chapter last-label fade verified");
  } else {
    console.log("\n✗ One or more checks failed — see above");
    process.exitCode = 1;
  }

} catch (err) {
  console.error("\nScript error:", err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
