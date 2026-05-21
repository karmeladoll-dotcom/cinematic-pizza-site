"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type BridgeVariant = "ember" | "basil" | "flour" | "smoke";

interface AtmosphericBridgeProps {
  variant?: BridgeVariant;
}

/**
 * A thin atmospheric connector rendered between page sections.
 * Height is minimal (~80–120px) so it does not disrupt section spacing.
 * Each variant carries a different set of floating organic elements:
 *   "ember"  → warm amber sparks drifting upward (hero → story boundary)
 *   "basil"  → soft green leaf silhouettes (story → ingredients boundary)
 *   "flour"  → misty white puffs (ingredients → pizzas boundary)
 *   "smoke"  → neutral haze (pizzas → reservation boundary)
 *
 * All elements are pointer-events: none and appear only when the bridge
 * enters the viewport. Desktop only — hidden on mobile to keep perf clean.
 */
export default function AtmosphericBridge({ variant = "ember" }: AtmosphericBridgeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const floatsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const floatEls = floatsRef.current?.querySelectorAll<HTMLElement>(".bridge-float");
      if (!floatEls?.length) return;

      // Fade in on scroll — once, not scrubbed, so elements stay visible
      gsap.fromTo(
        Array.from(floatEls),
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.8,
          stagger: 0.18,
          ease: "power1.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 88%",
            once: true,
          },
        }
      );

      // Continuous organic drift — each element gets its own loop
      floatEls.forEach((el, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        gsap.to(el, {
          y: `+=${7 + i * 2}`,
          x: `+=${dir * 5}`,
          rotation: `+=${dir * (variant === "basil" ? 9 : 5)}`,
          duration: 3.2 + i * 0.9,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.5,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [variant]);

  // On mobile we render nothing — performance and cleanliness
  const isMobileStyle = {
    display: "none",
  } as const;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: "relative",
        height: "clamp(60px, 9vw, 110px)",
        overflow: "visible",
        pointerEvents: "none",
        background: "transparent",
      }}
    >
      {/* Thin vertical accent line through the centre */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 1,
          background:
            variant === "basil"
              ? "linear-gradient(to bottom, transparent, rgba(45,130,60,0.14), transparent)"
              : variant === "flour"
              ? "linear-gradient(to bottom, transparent, rgba(255,247,228,0.10), transparent)"
              : "linear-gradient(to bottom, transparent, rgba(251,191,36,0.12), transparent)",
        }}
      />

      {/* Floating organic elements — hidden on small screens via CSS */}
      <div
        ref={floatsRef}
        className="bridge-floats-desktop"
        style={{
          position: "absolute",
          inset: 0,
        }}
      >
        {variant === "ember" && (
          <>
            {/* Three amber sparks at different horizontal positions */}
            <span
              className="bridge-float"
              style={{
                position: "absolute",
                left: "33%",
                top: "28%",
                width: 3,
                height: 3,
                borderRadius: "50%",
                background: "rgba(251,191,36,0.55)",
                boxShadow: "0 0 7px 2px rgba(251,191,36,0.30)",
                opacity: 0,
              }}
            />
            <span
              className="bridge-float"
              style={{
                position: "absolute",
                left: "50%",
                top: "55%",
                width: 2,
                height: 2,
                borderRadius: "50%",
                background: "rgba(249,115,22,0.60)",
                boxShadow: "0 0 9px 2px rgba(249,115,22,0.32)",
                opacity: 0,
              }}
            />
            <span
              className="bridge-float"
              style={{
                position: "absolute",
                left: "67%",
                top: "38%",
                width: 2,
                height: 2,
                borderRadius: "50%",
                background: "rgba(251,191,36,0.45)",
                boxShadow: "0 0 6px 2px rgba(251,191,36,0.25)",
                opacity: 0,
              }}
            />
          </>
        )}

        {variant === "basil" && (
          <>
            {/*
             * Basil leaves — organic CSS-shaped divs using a dual-axis
             * border-radius to produce a leaf silhouette.
             * mix-blend-mode: screen keeps them from muddying the background.
             */}
            <span
              className="bridge-float"
              style={{
                position: "absolute",
                left: "29%",
                top: "35%",
                width: 34,
                height: 17,
                borderRadius: "60% 40% 60% 40% / 70% 30% 70% 30%",
                background: "rgba(34, 118, 52, 0.22)",
                transform: "rotate(-28deg)",
                mixBlendMode: "screen",
                filter: "blur(0.4px)",
                opacity: 0,
              }}
            />
            <span
              className="bridge-float"
              style={{
                position: "absolute",
                left: "58%",
                top: "52%",
                width: 26,
                height: 13,
                borderRadius: "60% 40% 60% 40% / 70% 30% 70% 30%",
                background: "rgba(34, 118, 52, 0.17)",
                transform: "rotate(18deg)",
                mixBlendMode: "screen",
                filter: "blur(0.3px)",
                opacity: 0,
              }}
            />
            <span
              className="bridge-float"
              style={{
                position: "absolute",
                left: "44%",
                top: "20%",
                width: 20,
                height: 10,
                borderRadius: "60% 40% 60% 40% / 70% 30% 70% 30%",
                background: "rgba(34, 118, 52, 0.14)",
                transform: "rotate(-8deg)",
                mixBlendMode: "screen",
                filter: "blur(0.3px)",
                opacity: 0,
              }}
            />
          </>
        )}

        {variant === "flour" && (
          <>
            {/* Soft radial puffs — misty flour cloud effect */}
            <span
              className="bridge-float"
              style={{
                position: "absolute",
                left: "38%",
                top: "30%",
                width: 28,
                height: 28,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,252,242,0.14) 0%, transparent 68%)",
                filter: "blur(3px)",
                opacity: 0,
              }}
            />
            <span
              className="bridge-float"
              style={{
                position: "absolute",
                left: "54%",
                top: "55%",
                width: 20,
                height: 20,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,252,242,0.11) 0%, transparent 68%)",
                filter: "blur(2px)",
                opacity: 0,
              }}
            />
            <span
              className="bridge-float"
              style={{
                position: "absolute",
                left: "46%",
                top: "18%",
                width: 14,
                height: 14,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,252,242,0.10) 0%, transparent 68%)",
                filter: "blur(1.5px)",
                opacity: 0,
              }}
            />
          </>
        )}

        {variant === "smoke" && (
          <>
            {/* Neutral haze wisps */}
            <span
              className="bridge-float"
              style={{
                position: "absolute",
                left: "41%",
                top: "32%",
                width: 32,
                height: 20,
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse, rgba(220,210,195,0.09) 0%, transparent 65%)",
                filter: "blur(4px)",
                opacity: 0,
              }}
            />
            <span
              className="bridge-float"
              style={{
                position: "absolute",
                left: "52%",
                top: "60%",
                width: 22,
                height: 14,
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse, rgba(220,210,195,0.07) 0%, transparent 65%)",
                filter: "blur(3px)",
                opacity: 0,
              }}
            />
          </>
        )}
      </div>

      {/* Mobile: hide the floating elements via a simple style tag */}
      <style>{`
        @media (max-width: 767px) {
          .bridge-floats-desktop { display: none !important; }
        }
      `}</style>
    </div>
  );
}
