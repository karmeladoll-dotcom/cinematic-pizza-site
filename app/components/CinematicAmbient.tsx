"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Global ambient particle layer — fixed canvas, z-index 8 (below grain at 9).
 *
 * Two particle pools:
 *
 *   Flour / smoke  — cream-white, very slow upward drift, max ~0.055 opacity.
 *                    Creates the sense of a bakery atmosphere.
 *
 *   Embers         — amber / orange, faster upward drift, small radiant glow
 *                    drawn as two overlapping circles (inner bright + outer halo).
 *                    Suggests the wood-fired oven is always burning nearby.
 *
 * The canvas fades in only after the hero section has scrolled away so it
 * never competes with the cinematic pizza sequence.  Fully suppressed on
 * prefers-reduced-motion.
 */

interface FParticle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  opacity: number;
  targetOpacity: number;
}

interface EParticle extends FParticle {
  pulse: number;
  pulseSpeed: number;
}

export default function CinematicAmbient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const isMobile = window.innerWidth < 768;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();

    /* ── Flour / smoke particles ── */
    const FLOUR_COUNT  = isMobile ? 12 : 24;
    const FLOUR_MAX_A  = isMobile ? 0.026 : 0.052;

    const flour: FParticle[] = Array.from({ length: FLOUR_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 0.85 + 0.28,
      vx: (Math.random() - 0.5) * 0.08,
      vy: -(Math.random() * 0.12 + 0.022),
      opacity: 0,
      targetOpacity: Math.random() * FLOUR_MAX_A * 0.65 + FLOUR_MAX_A * 0.35,
    }));

    /* ── Ember particles ── */
    const EMBER_COUNT  = isMobile ? 6 : 14;
    const EMBER_MAX_A  = isMobile ? 0.08 : 0.16;

    const embers: EParticle[] = Array.from({ length: EMBER_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.0 + 0.5,
      vx: (Math.random() - 0.5) * 0.14,
      vy: -(Math.random() * 0.28 + 0.08),
      opacity: 0,
      targetOpacity: Math.random() * EMBER_MAX_A * 0.6 + EMBER_MAX_A * 0.4,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.018 + 0.006,
    }));

    /* ── Staggered fade-in — delayed until after hero load ── */
    flour.forEach((p, i) => {
      gsap.delayedCall(3.5 + i * 0.14, () => {
        gsap.to(p, { opacity: p.targetOpacity, duration: 3 + Math.random() * 2, ease: "sine.inOut" });
      });
    });

    embers.forEach((p, i) => {
      gsap.delayedCall(4.5 + i * 0.22, () => {
        gsap.to(p, { opacity: p.targetOpacity, duration: 2 + Math.random() * 2, ease: "sine.inOut" });
      });
    });

    /* ── Canvas fades in when hero exits ── */
    gsap.fromTo(
      canvas,
      { opacity: 0 },
      {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-pizza-section='hero']",
          start: "bottom 72%",
          end: "bottom 25%",
          scrub: 2,
        },
      }
    );

    /* ── RAF draw loop ── */
    let rafId = 0;

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* Flour particles — simple solid circles */
      for (const p of flour) {
        if (p.opacity < 0.002) continue;
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -4)             { p.y = canvas.height + 4; p.x = Math.random() * canvas.width; }
        if (p.x < 0)              p.x = canvas.width;
        if (p.x > canvas.width)   p.x = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 247, 228, ${p.opacity})`;
        ctx.fill();
      }

      /* Ember particles — double-circle glow (inner bright + outer halo) */
      for (const p of embers) {
        if (p.opacity < 0.002) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;
        /* Embers reset at top instead of bottom */
        if (p.y < -4)             { p.y = canvas.height + 4; p.x = Math.random() * canvas.width; }
        if (p.x < 0)              p.x = canvas.width;
        if (p.x > canvas.width)   p.x = 0;

        /* Pulsing opacity for the living-fire feel */
        const alpha = p.opacity * (0.65 + 0.35 * Math.sin(p.pulse));

        /* Outer halo */
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249, 120, 22, ${alpha * 0.28})`;
        ctx.fill();

        /* Inner bright core */
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 175, 45, ${alpha})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(tick);
    }
    tick();

    const onResize = () => resize();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 8,
        pointerEvents: "none",
        mixBlendMode: "screen",
        opacity: 0,
      }}
    />
  );
}
