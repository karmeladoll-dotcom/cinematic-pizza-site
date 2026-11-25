"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";

/**
 * Custom pointer for the menu: a fork (or a knife on rows that ask for it) with a
 * soft glow that trails behind. It tilts with the speed of the mouse, "leans in"
 * over a pizza row (taking that pizza's accent colour) and stabs on click, with a
 * small burst of embers. Only on fine pointers (mouse / trackpad); touch and
 * reduced-motion users keep the normal cursor.
 */

const CSS = `
.fx-cursor-zone, .fx-cursor-zone * { cursor: none !important; }
/* Devices without a mouse (phones, tablets): the fork/knife never exists. */
@media (hover: none), (pointer: coarse) { .fx-cursor-el { display: none !important; } }
`;

const TIP = { fork: 14.9, knife: 11 }; // x of the tip inside each SVG (px)

export default function FoodCursor({ zoneRef }: { zoneRef: RefObject<HTMLElement | null> }) {
  const toolRoot = useRef<HTMLDivElement>(null);
  const glowRoot = useRef<HTMLDivElement>(null);
  const toolRef = useRef<HTMLDivElement>(null);
  const forkRef = useRef<SVGSVGElement>(null);
  const knifeRef = useRef<SVGSVGElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const zone = zoneRef.current;
    const tRoot = toolRoot.current;
    const gRoot = glowRoot.current;
    const tool = toolRef.current;
    const glow = glowRef.current;
    const fork = forkRef.current;
    const knife = knifeRef.current;
    if (!zone || !tRoot || !gRoot || !tool || !glow || !fork || !knife) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) {
      /* no mouse / reduced motion: take the elements out of the page entirely
         (they used to stay parked at the top-left corner of the screen) */
      tRoot.style.display = "none";
      gRoot.style.display = "none";
      return;
    }

    zone.classList.add("fx-cursor-zone");

    gsap.set([tRoot, gRoot], { x: -100, y: -100, autoAlpha: 0 });
    gsap.set(tool, { rotation: -32, transformOrigin: "50% 0" });

    const tx = gsap.quickTo(tRoot, "x", { duration: 0.16, ease: "power3.out" });
    const ty = gsap.quickTo(tRoot, "y", { duration: 0.16, ease: "power3.out" });
    const gx = gsap.quickTo(gRoot, "x", { duration: 0.55, ease: "power3.out" });
    const gy = gsap.quickTo(gRoot, "y", { duration: 0.55, ease: "power3.out" });

    let lastX = 0;
    let row: Element | null = null;
    let visible = false;

    const setTool = (kind: "fork" | "knife") => {
      gsap.set(fork, { autoAlpha: kind === "fork" ? 1 : 0, x: -TIP.fork });
      gsap.set(knife, { autoAlpha: kind === "knife" ? 1 : 0, x: -TIP.knife });
    };
    setTool("fork");

    const show = () => {
      if (visible) return;
      visible = true;
      gsap.to([tRoot, gRoot], { autoAlpha: 1, duration: 0.25, overwrite: "auto" });
    };
    const hide = () => {
      visible = false;
      gsap.to([tRoot, gRoot], { autoAlpha: 0, duration: 0.25, overwrite: "auto" });
    };

    const applyRow = (next: Element | null) => {
      if (next === row) return;
      row = next;
      if (next) {
        const acc = getComputedStyle(next).getPropertyValue("--acc").trim() || "rgb(251,191,36)";
        const kind = (next.getAttribute("data-tool") as "fork" | "knife") || "fork";
        setTool(kind);
        tool.style.color = acc;
        glow.style.background = `radial-gradient(circle, ${acc} 0%, transparent 68%)`;
        gsap.to(tool, { scale: 1.14, duration: 0.4, ease: "back.out(2)", overwrite: "auto" });
        gsap.to(glow, { scale: 2.1, opacity: 0.55, duration: 0.5, ease: "power2.out", overwrite: "auto" });
      } else {
        setTool("fork");
        tool.style.color = "rgb(251,191,36)";
        glow.style.background = "radial-gradient(circle, rgb(251,191,36) 0%, transparent 68%)";
        gsap.to(tool, { scale: 1, duration: 0.4, ease: "power2.out", overwrite: "auto" });
        gsap.to(glow, { scale: 1, opacity: 0.32, duration: 0.5, ease: "power2.out", overwrite: "auto" });
      }
    };
    applyRow(null);

    const onMove = (e: PointerEvent) => {
      show();
      tx(e.clientX);
      ty(e.clientY);
      gx(e.clientX);
      gy(e.clientY);

      const vx = e.clientX - lastX;
      lastX = e.clientX;
      const base = row ? -12 : -32;
      const tilt = Math.max(-16, Math.min(16, vx * 1.1));
      gsap.to(tool, { rotation: base + tilt, duration: 0.45, ease: "power3.out", overwrite: "auto" });

      applyRow((e.target as Element | null)?.closest?.(".pz-row") ?? null);
    };

    const onDown = (e: PointerEvent) => {
      /* stab */
      gsap
        .timeline({ overwrite: "auto" })
        .to(tool, { y: 14, scale: 0.88, rotation: (row ? -6 : -24), duration: 0.08, ease: "power2.in" })
        .to(tool, { y: 0, scale: row ? 1.14 : 1, rotation: row ? -12 : -32, duration: 0.55, ease: "elastic.out(1,0.45)" });

      /* ember burst */
      const acc = row ? getComputedStyle(row).getPropertyValue("--acc").trim() : "rgb(251,191,36)";
      for (let i = 0; i < 12; i++) {
        const p = document.createElement("span");
        p.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:${3 + Math.random() * 3}px;height:${3 + Math.random() * 3}px;border-radius:50%;background:${acc};box-shadow:0 0 10px ${acc};pointer-events:none;z-index:59;`;
        document.body.appendChild(p);
        const a = Math.random() * Math.PI * 2;
        const d = 30 + Math.random() * 60;
        gsap.to(p, {
          x: Math.cos(a) * d,
          y: Math.sin(a) * d - 18,
          opacity: 0,
          scale: 0.2,
          duration: 0.7 + Math.random() * 0.5,
          ease: "power2.out",
          onComplete: () => p.remove(),
        });
      }
    };

    zone.addEventListener("pointermove", onMove);
    zone.addEventListener("pointerenter", show);
    zone.addEventListener("pointerleave", hide);
    zone.addEventListener("pointerdown", onDown);

    return () => {
      zone.classList.remove("fx-cursor-zone");
      zone.removeEventListener("pointermove", onMove);
      zone.removeEventListener("pointerenter", show);
      zone.removeEventListener("pointerleave", hide);
      zone.removeEventListener("pointerdown", onDown);
      gsap.killTweensOf([tRoot, gRoot, tool, glow, fork, knife]);
    };
  }, [zoneRef]);

  /* hidden until the effect confirms a real mouse and starts tracking it */
  const common = {
    position: "fixed",
    left: 0,
    top: 0,
    pointerEvents: "none",
    zIndex: 60,
    visibility: "hidden",
    opacity: 0,
  } as const;

  return (
    <>
      <style>{CSS}</style>

      {/* trailing glow */}
      <div ref={glowRoot} className="fx-cursor-el" aria-hidden="true" style={{ ...common, zIndex: 58 }}>
        <div
          ref={glowRef}
          style={{
            position: "absolute",
            left: -26,
            top: -26,
            width: 52,
            height: 52,
            borderRadius: "50%",
            opacity: 0.32,
            filter: "blur(6px)",
          }}
        />
      </div>

      {/* the tool itself — its tip sits exactly on the pointer */}
      <div ref={toolRoot} className="fx-cursor-el" aria-hidden="true" style={common}>
        <div
          ref={toolRef}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            color: "rgb(251,191,36)",
            filter: "drop-shadow(0 0 7px currentColor) drop-shadow(0 3px 6px rgba(0,0,0,0.6))",
          }}
        >
          {/* fork: tip centre at x = 14.9 */}
          <svg
            ref={forkRef}
            width="30"
            height="71"
            viewBox="0 0 38 90"
            fill="currentColor"
            style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
          >
            <rect x="6" y="0" width="3.4" height="26" rx="1.7" />
            <rect x="13.4" y="0" width="3.4" height="26" rx="1.7" />
            <rect x="20.8" y="0" width="3.4" height="26" rx="1.7" />
            <rect x="28.2" y="0" width="3.4" height="26" rx="1.7" />
            <path d="M6 20 H31.6 V30 C31.6 39 21.4 38 21.4 48 V84 A2.6 2.6 0 0 1 16.2 84 V48 C16.2 38 6 39 6 30 Z" />
          </svg>

          {/* knife: tip at x = 11 */}
          <svg
            ref={knifeRef}
            width="30"
            height="71"
            viewBox="0 0 38 90"
            fill="currentColor"
            style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
          >
            <path d="M14 0 C26 10 30 32 28.5 54 H14 Z" />
            <rect x="14" y="52" width="14.5" height="5" rx="1.5" />
            <rect x="15.5" y="57" width="11.5" height="31" rx="5" />
          </svg>
        </div>
      </div>
    </>
  );
}
