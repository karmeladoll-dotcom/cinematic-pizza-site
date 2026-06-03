"use client";

import React, { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Chapter II — The Source
 *
 * Three cinematic "shots", one per ingredient.  The section pins for
 * ≈3000 px and the scroll drives a crossfade between frames:
 *
 *   Frame I   San Marzano Tomatoes   — deep volcanic warmth, blood-red glow
 *   Frame II  Fior di Latte          — cream-white melt light, silk & heat
 *   Frame III Genovese Basil         — fragrant green, summer highlands
 *
 * Each frame reveals its content in order: roman numeral → name →
 * subtitle → origin → description.  A ghost numeral fills the frame
 * background at near-zero opacity to create layered typographic depth.
 *
 * Progress dots at the bottom track the active frame.
 */

const FRAMES = [
  {
    roman: "I",
    name: "San Marzano",
    subtitle: "Tomatoes",
    origin: "Campania, Italy",
    badge: "D.O.P. Certified",
    description:
      "Grown in the volcanic soil at the foot of Mount Vesuvius. Sweeter, less acidic — with a dense, fleshy pulp that forms the living soul of our sauce.",
    glow: "radial-gradient(ellipse 85% 80% at 50% 90%, rgba(185,38,38,0.18) 0%, rgba(220,75,50,0.08) 38%, transparent 68%)",
    accentColor: "rgba(220, 85, 60, 0.62)",
  },
  {
    roman: "II",
    name: "Fior di Latte",
    subtitle: "Mozzarella",
    origin: "Agerola, Italy",
    badge: "Hand-pulled · Fresh Daily",
    description:
      "Hand-pulled every morning from local cattle. Delicate and creamy — its silken texture melts into ribbons of silk across the heat of the oven floor.",
    glow: "radial-gradient(ellipse 85% 80% at 50% 85%, rgba(210,185,145,0.15) 0%, rgba(255,235,195,0.07) 40%, transparent 68%)",
    accentColor: "rgba(245, 215, 165, 0.58)",
  },
  {
    roman: "III",
    name: "Genovese",
    subtitle: "Basil",
    origin: "Genoese Highlands",
    badge: "Seasonal Harvest",
    description:
      "Harvested at the peak of the summer season. Fragrant and peppery, with sweet floral top notes that define the character of true Neapolitan cuisine.",
    glow: "radial-gradient(ellipse 85% 80% at 50% 85%, rgba(28,95,48,0.18) 0%, rgba(45,130,60,0.07) 40%, transparent 68%)",
    accentColor: "rgba(80, 165, 80, 0.55)",
  },
];

const PIN_SCROLL = 3000;

export default function IngredientsSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const frame1Ref   = useRef<HTMLDivElement>(null);
  const frame2Ref   = useRef<HTMLDivElement>(null);
  const frame3Ref   = useRef<HTMLDivElement>(null);
  const dotsRef     = useRef<HTMLDivElement>(null);
  const chapterRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      /* Collect frame content items */
      const f1Items = frame1Ref.current?.querySelectorAll<HTMLElement>(".fi");
      const f2Items = frame2Ref.current?.querySelectorAll<HTMLElement>(".fi");
      const f3Items = frame3Ref.current?.querySelectorAll<HTMLElement>(".fi");

      const dots = dotsRef.current?.querySelectorAll<HTMLElement>(".i-dot");

      /* ── Initial state ── */
      gsap.set(frame2Ref.current, { autoAlpha: 0 });
      gsap.set(frame3Ref.current, { autoAlpha: 0 });
      if (f1Items?.length) gsap.set(Array.from(f1Items), { autoAlpha: 0, y: 22 });
      if (f2Items?.length) gsap.set(Array.from(f2Items), { autoAlpha: 0, y: 22 });
      if (f3Items?.length) gsap.set(Array.from(f3Items), { autoAlpha: 0, y: 22 });

      /* ── Master scrub timeline ── */
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

      /* Chapter indicator (t 0→1) */
      tl.fromTo(
        chapterRef.current,
        { autoAlpha: 0, x: -16 },
        { autoAlpha: 1, x: 0, duration: 1, ease: "power2.out" },
        0
      );

      /* ─────────────── FRAME 1 — San Marzano ─────────────── */

      /* Content reveals staggered (t 0→2.2) */
      if (f1Items?.length) {
        tl.to(
          Array.from(f1Items),
          { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.22, ease: "power2.out" },
          0
        );
      }

      /* Dot 1 activates (t 0.2) */
      if (dots?.length) {
        tl.to(dots[0], { background: "rgba(251,191,36,0.72)", scale: 1.5, duration: 0.3 }, 0.2);
      }

      /* Hold frame 1 (t 2.2→3.0) */

      /* ─────────────── CROSSFADE 1 → 2 (t 3.0→3.5) ─────────────── */
      tl.to(frame1Ref.current, { autoAlpha: 0, duration: 0.4 }, 3.0);
      tl.to(frame2Ref.current, { autoAlpha: 1, duration: 0.4 }, 3.0);

      /* Dot update */
      if (dots?.length) {
        tl.to(dots[0], { background: "rgba(255,255,255,0.18)", scale: 1, duration: 0.3 }, 3.0);
        tl.to(dots[1], { background: "rgba(251,191,36,0.72)", scale: 1.5, duration: 0.3 }, 3.0);
      }

      /* ─────────────── FRAME 2 — Mozzarella ─────────────── */

      /* Content reveals (t 3.4→5.4) */
      if (f2Items?.length) {
        tl.to(
          Array.from(f2Items),
          { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.22, ease: "power2.out" },
          3.4
        );
      }

      /* Hold frame 2 (t 5.4→6.2) */

      /* ─────────────── CROSSFADE 2 → 3 (t 6.2→6.7) ─────────────── */
      tl.to(frame2Ref.current, { autoAlpha: 0, duration: 0.4 }, 6.2);
      tl.to(frame3Ref.current, { autoAlpha: 1, duration: 0.4 }, 6.2);

      if (dots?.length) {
        tl.to(dots[1], { background: "rgba(255,255,255,0.18)", scale: 1, duration: 0.3 }, 6.2);
        tl.to(dots[2], { background: "rgba(251,191,36,0.72)", scale: 1.5, duration: 0.3 }, 6.2);
      }

      /* ─────────────── FRAME 3 — Basil ─────────────── */

      /* Content reveals (t 6.6→8.5) */
      if (f3Items?.length) {
        tl.to(
          Array.from(f3Items),
          { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.22, ease: "power2.out" },
          6.6
        );
      }

      /* Final hold */
      tl.to({}, { duration: 2.0 }, 9.0);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* ── Shared frame JSX factory ── */
  function Frame({
    data,
    frameRef,
  }: {
    data: (typeof FRAMES)[number];
    frameRef: RefObject<HTMLDivElement | null>;
  }) {
    return (
      <div
        ref={frameRef}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          padding: "0 clamp(1.5rem, 8vw, 8rem)",
        }}
      >
        {/* Ingredient-specific ambient glow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: data.glow,
            pointerEvents: "none",
          }}
        />

        {/* Ghost roman numeral — large background typography */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: "-0.06em",
            bottom: "-0.18em",
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "clamp(24vw, 38vw, 52vw)",
            fontWeight: 300,
            color: "rgba(255,255,255,0.025)",
            lineHeight: 1,
            letterSpacing: "-0.04em",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {data.roman}
        </span>

        {/* Content text stack */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "clamp(320px, 55vw, 720px)",
          }}
        >
          {/* Roman numeral label */}
          <span
            className="fi"
            style={{
              display: "block",
              fontFamily: "var(--font-cinematic, serif)",
              fontSize: "clamp(0.6rem, 1vw, 0.9rem)",
              letterSpacing: "0.48em",
              textTransform: "uppercase",
              color: data.accentColor,
              marginBottom: "clamp(0.8rem, 1.5vw, 1.4rem)",
              opacity: 0,
            }}
          >
            {data.roman} — {data.badge}
          </span>

          {/* Main ingredient name */}
          <h2
            className="fi"
            style={{
              fontFamily: "var(--font-cinematic, serif)",
              fontSize: "clamp(3rem, 7.5vw, 9.5rem)",
              fontWeight: 300,
              color: "#ffffff",
              lineHeight: 0.95,
              letterSpacing: "-0.01em",
              marginBottom: "clamp(0.4rem, 0.8vw, 0.6rem)",
              opacity: 0,
            }}
          >
            {data.name}
          </h2>

          {/* Subtitle — ingredient type, accented */}
          <h3
            className="fi"
            style={{
              fontFamily: "var(--font-cinematic, serif)",
              fontSize: "clamp(1.4rem, 3.2vw, 4rem)",
              fontWeight: 300,
              fontStyle: "italic",
              color: data.accentColor,
              letterSpacing: "0.04em",
              marginBottom: "clamp(1.4rem, 2.5vw, 2.5rem)",
              opacity: 0,
            }}
          >
            {data.subtitle}
          </h3>

          {/* Thin separator */}
          <div
            className="fi"
            style={{
              width: "clamp(40px, 5vw, 70px)",
              height: "1px",
              background: `linear-gradient(to right, ${data.accentColor}, transparent)`,
              marginBottom: "clamp(1.4rem, 2.5vw, 2.5rem)",
              opacity: 0,
            }}
          />

          {/* Origin */}
          <p
            className="fi"
            style={{
              fontFamily: "var(--font-cinematic, serif)",
              fontSize: "0.55rem",
              letterSpacing: "0.44em",
              textTransform: "uppercase",
              color: "rgba(161,161,170,0.45)",
              marginBottom: "clamp(1rem, 1.8vw, 1.6rem)",
              opacity: 0,
            }}
          >
            {data.origin}
          </p>

          {/* Description */}
          <p
            className="fi"
            style={{
              fontFamily: "var(--font-cinematic, serif)",
              fontSize: "clamp(0.82rem, 1.2vw, 1.05rem)",
              color: "rgba(200,195,188,0.52)",
              lineHeight: 1.88,
              maxWidth: "48ch",
              opacity: 0,
            }}
          >
            {data.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section
      id="menu"
      data-pizza-section="ingredients"
      ref={sectionRef}
      style={{
        position: "relative",
        background: "#060606",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* ── Chapter indicator (top-left) ── */}
      <div
        ref={chapterRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "clamp(1.5rem, 3vw, 2.5rem)",
          left: "clamp(1.5rem, 5vw, 5rem)",
          opacity: 0,
          zIndex: 10,
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
          Chapter II — The Source
        </span>
      </div>

      {/* ── Three ingredient frames ── */}
      <Frame data={FRAMES[0]} frameRef={frame1Ref} />
      <Frame data={FRAMES[1]} frameRef={frame2Ref} />
      <Frame data={FRAMES[2]} frameRef={frame3Ref} />

      {/* ── Progress dots ── */}
      <div
        ref={dotsRef}
        style={{
          position: "absolute",
          bottom: "clamp(1.5rem, 3vw, 2.5rem)",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "0.55rem",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="i-dot"
            style={{
              display: "block",
              width: i === 0 ? 5 : 4,
              height: i === 0 ? 5 : 4,
              borderRadius: "50%",
              background: i === 0 ? "rgba(251,191,36,0.72)" : "rgba(255,255,255,0.18)",
              transition: "none",
            }}
          />
        ))}
      </div>

      {/* ── Top & bottom gradient bleed ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "18%",
          background: "linear-gradient(to bottom, #000 0%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: "14%",
          background: "linear-gradient(to top, #000 0%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />
    </section>
  );
}
