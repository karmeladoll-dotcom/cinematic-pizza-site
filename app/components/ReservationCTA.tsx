"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Chapter IV — The Invitation
 *
 * The final section of the film.  The oven has been burning since before
 * dawn; seventeen covers; one unforgettable meal.
 *
 * Enhancements over the original:
 *  • Three CSS smoke wisps rise from the bottom — pure CSS keyframe
 *    animations (no RAF overhead) for cinematic haze.
 *  • Two-layer oven glow: a wide diffuse field + a bright inner core.
 *  • Chapter indicator and a thin gold border accent.
 *  • Existing copy and CTA preserved verbatim.
 */
export default function ReservationCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemsRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const items = itemsRef.current?.querySelectorAll<HTMLElement>(".cta-item");
      if (items?.length) {
        gsap.fromTo(
          Array.from(items),
          { autoAlpha: 0, y: 45 },
          {
            autoAlpha: 1, y: 0,
            duration: 1.5, ease: "power2.out", stagger: 0.2,
            scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="reservation"
      data-pizza-section="reservation"
      ref={sectionRef}
      style={{
        position: "relative",
        background: "#060606",
        padding: "clamp(8rem, 16vw, 20rem) clamp(1.5rem, 8vw, 8rem)",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* ── CSS smoke wisps — no RAF required ── */}
      <style>{`
        @keyframes smokeRise1 {
          0%   { opacity: 0;    transform: translateY(0)     scaleX(1.00); }
          20%  { opacity: 0.85; }
          80%  { opacity: 0.55; }
          100% { opacity: 0;    transform: translateY(-90px) scaleX(1.45); }
        }
        @keyframes smokeRise2 {
          0%   { opacity: 0;    transform: translateY(0)     scaleX(1.00); }
          25%  { opacity: 0.70; }
          75%  { opacity: 0.45; }
          100% { opacity: 0;    transform: translateY(-75px) scaleX(1.35); }
        }
        @keyframes smokeRise3 {
          0%   { opacity: 0;    transform: translateY(0)     scaleX(1.00); }
          30%  { opacity: 0.60; }
          70%  { opacity: 0.35; }
          100% { opacity: 0;    transform: translateY(-60px) scaleX(1.25); }
        }
        @keyframes ovenPulse {
          0%, 100% { opacity: 0.72; }
          50%      { opacity: 1.00; }
        }
      `}</style>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          height: "55%",
          pointerEvents: "none",
        }}
      >
        {/* Smoke wisp 1 — centre */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "48%",
            width: "clamp(80px, 14vw, 180px)",
            height: "clamp(80px, 14vw, 180px)",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(255,225,180,0.10) 0%, transparent 68%)",
            filter: "blur(18px)",
            animation: "smokeRise1 7s ease-out infinite",
          }}
        />
        {/* Smoke wisp 2 — left offset */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "38%",
            width: "clamp(60px, 10vw, 130px)",
            height: "clamp(60px, 10vw, 130px)",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(255,210,160,0.08) 0%, transparent 68%)",
            filter: "blur(22px)",
            animation: "smokeRise2 9s ease-out infinite 2.2s",
          }}
        />
        {/* Smoke wisp 3 — right offset */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "56%",
            width: "clamp(50px, 8vw, 110px)",
            height: "clamp(50px, 8vw, 110px)",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(255,195,140,0.07) 0%, transparent 68%)",
            filter: "blur(20px)",
            animation: "smokeRise3 11s ease-out infinite 4.5s",
          }}
        />
      </div>

      {/* ── Wide diffuse oven glow field ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 65% at 50% 55%, rgba(249,115,22,0.07) 0%, rgba(251,191,36,0.04) 35%, transparent 68%)",
          pointerEvents: "none",
          animation: "ovenPulse 4.5s ease-in-out infinite",
        }}
      />

      {/* ── Bright inner glow core ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 40% 35% at 50% 55%, rgba(251,191,36,0.06) 0%, transparent 62%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Top border accent ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0, left: "8%", right: "8%",
          height: "1px",
          background:
            "linear-gradient(to right, transparent, rgba(251,191,36,0.22), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* ── Chapter indicator ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "clamp(1.5rem, 3vw, 2.5rem)",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "0.48rem",
            letterSpacing: "0.52em",
            textTransform: "uppercase",
            color: "rgba(251,191,36,0.28)",
          }}
        >
          Chapter IV — The Invitation
        </span>
      </div>

      {/* ── Content ── */}
      <div ref={itemsRef}>
        {/* Label */}
        <span
          className="cta-item"
          style={{
            display: "block",
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "0.58rem",
            letterSpacing: "0.55em",
            textTransform: "uppercase",
            color: "rgba(251,191,36,0.5)",
            marginBottom: "2.2rem",
            opacity: 0,
          }}
        >
          An Invitation
        </span>

        {/* Main heading */}
        <h2
          className="cta-item"
          style={{
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "clamp(2.8rem, 8vw, 9.5rem)",
            fontWeight: 300,
            color: "#ffffff",
            letterSpacing: "0.03em",
            lineHeight: 1.0,
            marginBottom: "2.8rem",
            opacity: 0,
          }}
        >
          Reserve Your
          <br />
          <em style={{ fontStyle: "italic", color: "rgba(251,191,36,0.92)" }}>
            Experience
          </em>
        </h2>

        {/* Supporting text */}
        <p
          className="cta-item"
          style={{
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "clamp(0.82rem, 1.4vw, 1.08rem)",
            color: "rgba(161,161,170,0.42)",
            maxWidth: 500,
            margin: "0 auto 3.8rem",
            lineHeight: 1.95,
            letterSpacing: "0.02em",
            opacity: 0,
          }}
        >
          An intimate dining room. A wood-fired oven burning since dawn.
          Seventeen covers each evening. One unforgettable meal.
        </p>

        {/* CTA Button */}
        <div className="cta-item" style={{ opacity: 0 }}>
          <a
            href="mailto:reservations@fornonero.com"
            style={{
              display: "inline-block",
              fontFamily: "var(--font-cinematic, serif)",
              fontSize: "0.62rem",
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: "#050505",
              background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
              padding: "1.15rem 3.2rem",
              textDecoration: "none",
              transition: "all 0.45s ease",
              animation: "amber-pulse 2.8s ease-in-out infinite",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 90px rgba(251,191,36,0.45), 0 10px 50px rgba(0,0,0,0.55)";
              e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 45px rgba(251,191,36,0.28), 0 6px 30px rgba(0,0,0,0.45)";
              e.currentTarget.style.transform = "translateY(0) scale(1)";
            }}
          >
            Reserve a Table
          </a>
        </div>
      </div>
    </section>
  );
}
