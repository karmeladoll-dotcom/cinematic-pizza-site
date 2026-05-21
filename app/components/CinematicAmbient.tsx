"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface FlourParticle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  opacity: number;
  targetOpacity: number;
}

/**
 * Global ambient flour/smoke particle layer.
 * Fixed canvas, z-index 8 (below grain overlay at 9, above sections).
 * Fades in only after the hero section has scrolled away, so it does not
 * compete with the cinematic hero image sequence.
 * Very deliberately subtle — max single-particle opacity ≈ 0.055 desktop,
 * 0.03 mobile.
 */
export default function CinematicAmbient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const isMobile = window.innerWidth < 768;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();

    const COUNT = isMobile ? 14 : 28;
    const MAX_ALPHA = isMobile ? 0.028 : 0.055;

    const particles: FlourParticle[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 0.9 + 0.3,
      vx: (Math.random() - 0.5) * 0.08,
      vy: -(Math.random() * 0.12 + 0.025),
      opacity: 0,
      targetOpacity: Math.random() * MAX_ALPHA * 0.65 + MAX_ALPHA * 0.35,
    }));

    // Staggered fade-in — particles materialise slowly after hero load
    particles.forEach((p, i) => {
      gsap.delayedCall(3.2 + i * 0.14, () => {
        gsap.to(p, {
          opacity: p.targetOpacity,
          duration: 2.8 + Math.random() * 2,
          ease: "sine.inOut",
        });
      });
    });

    // Canvas-level fade: invisible while hero fills the screen,
    // gently emerges as the user scrolls past it.
    gsap.fromTo(
      canvas,
      { opacity: 0 },
      {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-pizza-section='hero']",
          start: "bottom 70%",
          end: "bottom 20%",
          scrub: 2,
        },
      }
    );

    let rafId = 0;
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        if (p.opacity < 0.002) continue;
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -4) {
          p.y = canvas.height + 4;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 247, 228, ${p.opacity})`;
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
