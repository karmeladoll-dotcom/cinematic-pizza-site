"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Chapter I — The Philosophy
 *
 * Scroll direction = camera movement.  The section pins for ≈2500 px of
 * scroll so the experience unfolds in cinematic slow-motion:
 *
 *   0 → 25%   Warm oven glow rises from below. Smoke materialises.
 *  12 → 24%   Thin amber line sweeps in — the breath before the speech.
 *  20 → 65%   Six words of the manifesto reveal one by one, each lit by
 *              the glow rising beneath them.
 *  65 → 80%   Chapter label + provenance text emerge.
 *  80 → 100%  Section holds — the camera lingers, then scroll resumes.
 */

const WORDS: { t: string; accent: boolean; italic: boolean }[] = [
  { t: "Crafted",    accent: false, italic: false },
  { t: "through",    accent: false, italic: false },
  { t: "fire,",      accent: false, italic: false },
  { t: "patience",   accent: true,  italic: true  },
  { t: "and",        accent: false, italic: false },
  { t: "obsession.", accent: true,  italic: false },
];

const PIN_SCROLL = 2500;

export default function StorySection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const glowRef     = useRef<HTMLDivElement>(null);
  const smoke1Ref   = useRef<HTMLDivElement>(null);
  const smoke2Ref   = useRef<HTMLDivElement>(null);
  const lineRef     = useRef<HTMLDivElement>(null);
  const wordsRef    = useRef<HTMLDivElement>(null);
  const labelRef    = useRef<HTMLSpanElement>(null);
  const subRef      = useRef<HTMLParagraphElement>(null);
  const chapterRef  = useRef<HTMLDivElement>(null);
  const ember1Ref   = useRef<HTMLSpanElement>(null);
  const ember2Ref   = useRef<HTMLSpanElement>(null);
  const ember3Ref   = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const words = wordsRef.current?.querySelectorAll<HTMLElement>(".s-word");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${PIN_SCROLL}`,
          pin: true,
          scrub: 1.0,
          anticipatePin: 1,
        },
      });

      /* Chapter indicator slides in from left (t 0 → 1.2) */
      tl.fromTo(
        chapterRef.current,
        { autoAlpha: 0, x: -18 },
        { autoAlpha: 1, x: 0, duration: 1.2, ease: "power2.out" },
        0
      );

      /* Oven glow rises (t 0 → 2.8) */
      tl.fromTo(
        glowRef.current,
        { opacity: 0, y: 55, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 2.8, ease: "power2.out" },
        0
      );

      /* Primary smoke haze (t 0.2 → 3.5) */
      tl.fromTo(
        smoke1Ref.current,
        { opacity: 0, y: 28, scaleX: 0.88 },
        { opacity: 1, y: -14, scaleX: 1, duration: 3.3, ease: "power1.out" },
        0.2
      );

      /* Secondary smoke — offset horizontally for depth (t 0.6 → 3.8) */
      tl.fromTo(
        smoke2Ref.current,
        { opacity: 0, y: 22, scaleX: 0.82 },
        { opacity: 1, y: -8, scaleX: 1, duration: 3.2, ease: "sine.out" },
        0.6
      );

      /* Decorative amber line (t 1.2 → 2.4) */
      tl.fromTo(
        lineRef.current,
        { scaleX: 0, autoAlpha: 0, transformOrigin: "center" },
        { scaleX: 1, autoAlpha: 1, duration: 1.2, ease: "power3.out" },
        1.2
      );

      /* Ember sparks drift in (t 1.5 → 3) */
      tl.fromTo(
        [ember1Ref.current, ember2Ref.current, ember3Ref.current],
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.3, ease: "power2.out" },
        1.5
      );

      /* Words reveal — one by one (t 2.0 → 4.4) */
      if (words?.length) {
        tl.fromTo(
          Array.from(words),
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.28,
            ease: "power3.out",
          },
          2.0
        );
      }

      /* Chapter label (t 6.2 → 7.2) */
      tl.fromTo(
        labelRef.current,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 1.0, ease: "power2.out" },
        6.2
      );

      /* Provenance text (t 7.0 → 8.0) */
      tl.fromTo(
        subRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 1.0, ease: "power2.out" },
        7.0
      );

      /* Hold at full reveal */
      tl.to({}, { duration: 2.0 }, 8.5);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="story"
      data-pizza-section="story"
      ref={sectionRef}
      style={{
        position: "relative",
        background: "#060606",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {/* ── Top gradient bleed from hero ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "22%",
          background: "linear-gradient(to bottom, #000 0%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* ── Warm oven glow — amber/orange rising from below ── */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: "72%",
          background:
            "radial-gradient(ellipse 85% 100% at 50% 100%, rgba(249,115,22,0.24) 0%, rgba(251,191,36,0.14) 26%, rgba(251,191,36,0.05) 52%, transparent 70%)",
          pointerEvents: "none",
          opacity: 0,
          willChange: "transform, opacity",
        }}
      />

      {/* ── Cinematic smoke — primary haze ── */}
      <div
        ref={smoke1Ref}
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "14%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "68%",
          height: "42%",
          background:
            "radial-gradient(ellipse at bottom center, rgba(255,220,175,0.065) 0%, transparent 64%)",
          pointerEvents: "none",
          opacity: 0,
          filter: "blur(26px)",
          willChange: "transform, opacity",
        }}
      />

      {/* ── Cinematic smoke — secondary haze (offset for depth) ── */}
      <div
        ref={smoke2Ref}
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "8%",
          left: "38%",
          width: "48%",
          height: "38%",
          background:
            "radial-gradient(ellipse at bottom left, rgba(255,200,140,0.04) 0%, transparent 60%)",
          pointerEvents: "none",
          opacity: 0,
          filter: "blur(32px)",
          willChange: "transform, opacity",
        }}
      />

      {/* ── Drifting ember sparks ── */}
      <span
        ref={ember1Ref}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "22%", left: "16%",
          width: 2, height: 2,
          borderRadius: "50%",
          background: "rgba(251,191,36,0.6)",
          boxShadow: "0 0 8px 3px rgba(251,191,36,0.22)",
          pointerEvents: "none",
          opacity: 0,
          animation: "stEmberA 7s ease-in-out infinite",
        }}
      />
      <span
        ref={ember2Ref}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "68%", right: "18%",
          width: 2, height: 2,
          borderRadius: "50%",
          background: "rgba(249,115,22,0.55)",
          boxShadow: "0 0 7px 3px rgba(249,115,22,0.18)",
          pointerEvents: "none",
          opacity: 0,
          animation: "stEmberB 9s ease-in-out infinite 1.8s",
        }}
      />
      <span
        ref={ember3Ref}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "42%", left: "8%",
          width: 1.5, height: 1.5,
          borderRadius: "50%",
          background: "rgba(255,160,40,0.45)",
          boxShadow: "0 0 5px 2px rgba(255,160,40,0.16)",
          pointerEvents: "none",
          opacity: 0,
          animation: "stEmberA 5.5s ease-in-out infinite 3s",
        }}
      />
      <style>{`
        @keyframes stEmberA {
          0%, 100% { opacity: 0.15; transform: translateY(0px); }
          50%       { opacity: 0.65; transform: translateY(-10px); }
        }
        @keyframes stEmberB {
          0%, 100% { opacity: 0.10; transform: translateY(0px); }
          50%       { opacity: 0.48; transform: translateY(-7px); }
        }
      `}</style>

      {/* ── Chapter indicator (top-left) ── */}
      <div
        ref={chapterRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "clamp(1.5rem, 3vw, 2.5rem)",
          left: "clamp(1.5rem, 5vw, 5rem)",
          opacity: 0,
          zIndex: 5,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "0.48rem",
            letterSpacing: "0.52em",
            textTransform: "uppercase",
            color: "rgba(251,191,36,0.32)",
          }}
        >
          Chapter I — The Philosophy
        </span>
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          width: "100%",
          maxWidth: 1100,
          padding: "0 clamp(1.5rem, 8vw, 8rem)",
        }}
      >
        {/* Thin amber line */}
        <div
          ref={lineRef}
          style={{
            width: "clamp(40px, 5vw, 72px)",
            height: "1px",
            background:
              "linear-gradient(to right, transparent, rgba(251,191,36,0.72), transparent)",
            margin: "0 auto 3rem",
            opacity: 0,
          }}
        />

        {/* Word-by-word headline */}
        <div
          ref={wordsRef}
          style={{
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "clamp(2.4rem, 6vw, 7.2rem)",
            fontWeight: 300,
            letterSpacing: "0.022em",
            lineHeight: 1.22,
          }}
        >
          {WORDS.map((w, i) => (
            <span
              key={i}
              className="s-word"
              style={{
                display: "inline-block",
                marginRight: "0.25em",
                opacity: 0,
                color: w.accent ? "rgba(251,191,36,0.92)" : "#ffffff",
                fontStyle: w.italic ? "italic" : "normal",
                textShadow: w.accent
                  ? "0 0 80px rgba(251,191,36,0.28), 0 4px 40px rgba(0,0,0,0.5)"
                  : "0 4px 40px rgba(0,0,0,0.5)",
              }}
            >
              {w.t}
            </span>
          ))}
        </div>

        {/* Section label */}
        <span
          ref={labelRef}
          style={{
            display: "block",
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "0.56rem",
            letterSpacing: "0.55em",
            textTransform: "uppercase",
            color: "rgba(251,191,36,0.40)",
            marginTop: "3.5rem",
            opacity: 0,
          }}
        >
          The Philosophy
        </span>

        {/* Provenance sub-text */}
        <p
          ref={subRef}
          style={{
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "clamp(0.58rem, 1.1vw, 0.76rem)",
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: "rgba(161,161,170,0.26)",
            marginTop: "0.9rem",
            opacity: 0,
          }}
        >
          Naples · Italy · Est. 1987
        </p>
      </div>

      {/* ── Bottom gradient ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: "16%",
          background: "linear-gradient(to top, #000 0%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
    </section>
  );
}
