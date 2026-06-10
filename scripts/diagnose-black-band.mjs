/**
 * Diagnostic script for the black-band stutter at chapter transitions.
 * Scrolls through the fire→mozzarella and pomodoro→dough exit-blend zones,
 * pauses mid-transition, and captures computed opacities, rects, z-indices,
 * stacking positions, and sampled pixel brightness for every relevant layer.
 *
 * Run: node scripts/diagnose-black-band.mjs
 */
import { chromium } from "playwright";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const BASE = "http://localhost:3000";
const __dir = dirname(fileURLToPath(import.meta.url));

// ─── helpers ────────────────────────────────────────────────────────────────

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

/** Scroll to an absolute Y, wait for scrub to settle. */
async function scrollTo(page, y, settleMs = 700) {
  await page.evaluate((sy) => window.scrollTo(0, sy), y);
  await page.waitForTimeout(settleMs);
}

/**
 * Capture the full layer state at the current scroll position.
 * Returns rich diagnostic data for both transition zones.
 */
async function captureLayerState(page, label) {
  return page.evaluate((lbl) => {
    // ── locate sections ──────────────────────────────────────────────────
    const fireSection   = document.querySelector("[data-pizza-section='story']");
    const sourceSection = document.querySelector("[data-pizza-section='ingredients']");
    const resultSection = document.querySelector("[data-pizza-section='result']");

    function sectionInfo(section, name) {
      if (!section) return { name, found: false };
      const rect  = section.getBoundingClientRect();
      const cs    = getComputedStyle(section);
      const spacer = section.closest(".pin-spacer");
      const spacerRect = spacer ? spacer.getBoundingClientRect() : null;

      // All direct absolute-positioned children (slide divs + blendIn/blendOut)
      const layers = Array.from(section.children).map((el, idx) => {
        const elCs   = getComputedStyle(el);
        const elRect = el.getBoundingClientRect();
        // First video child (if any)
        const video  = el.querySelector("video");
        const vCs    = video ? getComputedStyle(video) : null;
        const vRect  = video ? video.getBoundingClientRect() : null;
        return {
          idx,
          tag: el.tagName,
          zIndex:      elCs.zIndex,
          opacity:     elCs.opacity,
          visibility:  elCs.visibility,
          position:    elCs.position,
          inlineOpacity: el.style.opacity,
          top:         Math.round(elRect.top),
          height:      Math.round(elRect.height),
          inViewport:  elRect.bottom > 0 && elRect.top < window.innerHeight,
          videoSrc:    video ? (video.src || video.dataset.src || "").split("/").pop() : null,
          videoOpacity:   vCs?.opacity ?? null,
          videoReadyState: video?.readyState ?? null,
          videoRect: vRect ? { top: Math.round(vRect.top), height: Math.round(vRect.height) } : null,
        };
      });

      return {
        name,
        found: true,
        scrollY:      Math.round(window.scrollY),
        sectionTop:   Math.round(rect.top),
        sectionBot:   Math.round(rect.bottom),
        sectionH:     Math.round(rect.height),
        position:     cs.position,
        overflow:     cs.overflow,
        zIndex:       cs.zIndex,
        isolation:    cs.isolation,
        bg:           cs.backgroundColor,
        pinned:       cs.position === "fixed",
        spacerTop:    spacerRect ? Math.round(spacerRect.top) : null,
        spacerH:      spacerRect ? Math.round(spacerRect.height) : null,
        inViewport:   rect.bottom > 0 && rect.top < window.innerHeight,
        layers,
      };
    }

    // ── pixel brightness scan ────────────────────────────────────────────
    // Sample a vertical strip (x = 50%) for the full viewport height.
    // Returns average RGB brightness per 50px band.
    function brightnessColumn() {
      const bands = [];
      const x = Math.round(window.innerWidth / 2);
      const step = 50;
      for (let y = 0; y < window.innerHeight; y += step) {
        const el = document.elementFromPoint(x, y);
        if (!el) { bands.push({ y, topEl: null, brightness: null }); continue; }
        const elCs = getComputedStyle(el);
        // Parse rgb(r,g,b) or rgba(r,g,b,a) background
        const match = elCs.backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        const brightness = match
          ? Math.round((parseInt(match[1]) + parseInt(match[2]) + parseInt(match[3])) / 3)
          : null;
        bands.push({
          y,
          topEl: `${el.tagName}[data-pizza-section="${el.dataset?.pizzaSection ?? ""}"].z${elCs.zIndex}`,
          bg: elCs.backgroundColor,
          brightness,
          opacity: elCs.opacity,
        });
      }
      return bands;
    }

    // ── GSAP ScrollTrigger summary ───────────────────────────────────────
    function scrollTriggerSummary() {
      if (typeof window.gsap === "undefined") return { available: false };
      const ST = window.gsap.plugins?.ScrollTrigger ?? window.ScrollTrigger;
      if (!ST) return { available: false };
      return {
        available: true,
        triggers: ST.getAll().map((t) => ({
          id:    t.vars?.id ?? "(no id)",
          start: Math.round(t.start),
          end:   Math.round(t.end),
          progress: Math.round(t.progress * 1000) / 1000,
          pin:   !!t.pin,
          trigger: t.trigger
            ? `${t.trigger.tagName}[data-pizza-section="${t.trigger.dataset?.pizzaSection ?? ""}"]`
            : null,
        })),
      };
    }

    return {
      label: lbl,
      scrollY: Math.round(window.scrollY),
      viewportH: window.innerHeight,
      fire:   sectionInfo(fireSection,   "fire"),
      source: sectionInfo(sourceSection, "source"),
      result: sectionInfo(resultSection, "result"),
      brightnessColumn: brightnessColumn(),
      scrollTriggers: scrollTriggerSummary(),
    };
  }, label);
}

// ── main ─────────────────────────────────────────────────────────────────────

const browser = await chromium.launch({ headless: true });
const page    = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const results = [];
const shots   = [];

try {
  console.log("Loading page…");
  await page.goto(BASE, { waitUntil: "networkidle" });
  await waitForPageReady(page);

  // ── Step 0: find pin windows by scanning for when section is pinned ──
  console.log("\nScanning 0..6000px in 60px steps to locate pin windows…");

  const pinWindows = { fire: null, source: null };

  for (let y = 0; y <= 6000; y += 60) {
    await page.evaluate((sy) => window.scrollTo(0, sy), y);
    await page.waitForTimeout(40);
    const pins = await page.evaluate(() => {
      const fire   = document.querySelector("[data-pizza-section='story']");
      const source = document.querySelector("[data-pizza-section='ingredients']");
      return {
        y: Math.round(window.scrollY),
        firePinned:   fire   ? getComputedStyle(fire).position   === "fixed" : false,
        sourcePinned: source ? getComputedStyle(source).position === "fixed" : false,
      };
    });
    if (pins.firePinned   && !pinWindows.fire)   { pinWindows.fire   = { start: y }; }
    if (!pins.firePinned  &&  pinWindows.fire  && !pinWindows.fire.end)  { pinWindows.fire.end   = y; }
    if (pins.sourcePinned && !pinWindows.source) { pinWindows.source = { start: y }; }
    if (!pins.sourcePinned && pinWindows.source && !pinWindows.source.end) { pinWindows.source.end = y; }
    if (pinWindows.fire?.end && pinWindows.source?.end) break;
  }

  console.log("Pin windows found:", JSON.stringify(pinWindows));

  // Use actual measurements; fall back to estimates if scan missed them.
  const fireStart = pinWindows.fire?.start ?? 1912;
  const fireEnd   = pinWindows.fire?.end   ?? fireStart + 420;
  const srcStart  = pinWindows.source?.start ?? fireEnd + 400;
  const srcEnd    = pinWindows.source?.end   ?? srcStart + 1260;

  // ── Probe 1: fire→mozzarella transition ──────────────────────────────
  // Focus on the exit-blend zone AND the gap after fire un-pins.
  console.log(`\nProbing fire exit + gap: ${fireStart}–${Math.min(srcStart + 60, fireEnd + 900)}`);

  for (const y of [
    fireStart + Math.round((fireEnd - fireStart) * 0.75),
    fireStart + Math.round((fireEnd - fireStart) * 0.90),
    fireEnd - 10,
    fireEnd + 10,
    fireEnd + Math.round((srcStart - fireEnd) * 0.50),
    srcStart - 10,
    srcStart + 10,
  ].filter(v => v > 0)) {
    await scrollTo(page, y, 700);
    const state = await captureLayerState(page, `y${y}`);
    results.push(state);

    const label = y < fireEnd ? `fire_pin_${Math.round((y-fireStart)/(fireEnd-fireStart)*100)}%`
                : y < srcStart ? `gap_${y - fireEnd}px_after_fire_unpin`
                : `src_pin_start+${y - srcStart}px`;
    const shotPath = join(__dir, `dbg-${label.replace(/[^a-z0-9_+%-]/gi, "-")}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    shots.push(shotPath);

    const firePinned   = state.fire.pinned;
    const sourcePinned = state.source.pinned;
    const sourceTop    = state.source.sectionTop;

    console.log(
      `\n  y=${y} [${label}]` +
      `\n    fire: pinned=${firePinned} top=${state.fire.sectionTop}` +
      `\n    source: pinned=${sourcePinned} top=${sourceTop} inVP=${state.source.inViewport}`
    );

    const fireLayers = state.fire.layers ?? [];
    fireLayers.filter(l => l.inViewport || l.opacity > 0).forEach(l =>
      console.log(`    fire.L${l.idx}  z=${l.zIndex} op=${l.opacity} video=${l.videoSrc} ready=${l.videoReadyState}`)
    );

    const srcLayers = state.source.layers ?? [];
    srcLayers.filter(l => l.inViewport || l.opacity > 0).forEach(l =>
      console.log(`    src.L${l.idx}   z=${l.zIndex} op=${l.opacity} video=${l.videoSrc} ready=${l.videoReadyState}`)
    );

    // Screenshot pixel sampling: read 5 rows × 2 cols and report average brightness
    const pixels = await page.evaluate(() => {
      const W = window.innerWidth, H = window.innerHeight;
      const points = [
        { x: W/2, y: H * 0.1 },
        { x: W/2, y: H * 0.25 },
        { x: W/2, y: H * 0.5 },
        { x: W/2, y: H * 0.75 },
        { x: W/2, y: H * 0.9 },
      ];
      return points.map(({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        // Walk up to find first el with non-transparent bg
        let cur = el;
        while (cur && cur !== document.body) {
          const bg = getComputedStyle(cur).backgroundColor;
          const m  = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (m && !(m[1]==="0"&&m[2]==="0"&&m[3]==="0"&&bg.includes("0)"))) {
            const b = Math.round((+m[1] + +m[2] + +m[3]) / 3);
            return { y: Math.round(y), el: cur.tagName + (cur.dataset?.pizzaSection ? `[${cur.dataset.pizzaSection}]` : ""), bg, brightness: b };
          }
          cur = cur.parentElement;
        }
        const bodyBg = getComputedStyle(document.body).backgroundColor;
        const m2 = bodyBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return { y: Math.round(y), el: "BODY", bg: bodyBg, brightness: m2 ? Math.round((+m2[1]+m2[2]+m2[3])/3) : 0 };
      });
    });
    pixels.forEach(p =>
      console.log(`    px y=${p.y}: brightness=${p.brightness} el=${p.el} bg="${p.bg}"`)
    );
  }

  // ── Probe 2: source→result (pomodoro→dough) ──────────────────────────
  if (pinWindows.source?.start) {
    const resStart = pinWindows.result?.start ?? srcEnd + 400;
    console.log(`\nProbing source exit + gap around y=${srcEnd}`);
    for (const y of [
      srcStart + Math.round((srcEnd - srcStart) * 0.85),
      srcEnd - 10,
      srcEnd + 10,
      srcEnd + 200,
    ].filter(v => v > 0)) {
      await scrollTo(page, y, 700);
      const state = await captureLayerState(page, `src_y${y}`);
      results.push(state);
      const shotPath = join(__dir, `dbg-src-y${y}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
      shots.push(shotPath);
      console.log(`\n  y=${y}  source.pinned=${state.source.pinned} result.pinned=${state.result.pinned}`);
      (state.source.layers ?? []).filter(l => l.inViewport || l.opacity > 0).forEach(l =>
        console.log(`    src.L${l.idx} z=${l.zIndex} op=${l.opacity} video=${l.videoSrc}`)
      );
    }
  }

  // ── Dump full JSON for offline analysis ─────────────────────────────
  const jsonPath = join(__dir, "diagnose-black-band-results.json");
  writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`\nFull results → ${jsonPath}`);
  console.log(`Screenshots  → ${shots.join(", ")}`);

} catch (err) {
  console.error("\nScript error:", err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
