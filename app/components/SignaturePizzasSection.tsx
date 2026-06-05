"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Chapter III — The Creation
 *
 * Transforms the standard card grid into a cinematic editorial list.
 * Each pizza is a full-width row — a film frame, not a product tile.
 *
 * Layout:
 *   Ghost numeral (enormous, near-transparent) fills the background.
 *   Left: roman numeral · name (very large) · note / badge
 *   Right: price (amber, prominent)
 *   Full-width: description text + thin gold separator below each row.
 *
 * GSAP: each row slides in independently as its top edge crosses 72%
 * of the viewport — staggered for rhythm, not simultaneity.
 */

const PIZZAS = [
  {
    roman: "I",
    number: "01",
    name: "Margherita D.O.C.",
    badge: "Signature",
    description:
      "San Marzano tomato, Fior di Latte, aged Parmigiano Reggiano, Genovese basil, Sicilian extra-virgin olive oil. The original. Unrepeatable.",
    price: "€ 22",
    note: "Neapolitan Classic",
    ghostColor: "rgba(255,255,255,0.018)",
    accentColor: "rgba(251,191,36,0.75)",
    glowColor: "rgba(251,191,36,0.06)",
  },
  {
    roman: "II",
    number: "02",
    name: "Diavola Calabrese",
    badge: "Chef's Pick",
    description:
      "Crushed San Marzano, Fior di Latte, spicy Calabrian salami, hand-pressed Nduja, chilli-infused oil, fresh wild oregano.",
    price: "€ 26",
    note: "Spicy & Bold",
    ghostColor: "rgba(255,255,255,0.018)",
    accentColor: "rgba(249,115,22,0.75)",
    glowColor: "rgba(249,115,22,0.055)",
  },
  {
    roman: "III",
    number: "03",
    name: "Tartufo Nero",
    badge: "Premium",
    description:
      "Truffle cream base, Fior di Latte, shaved Périgord black truffle, wild porcini, aged Pecorino Romano, white truffle finishing oil.",
    price: "€ 38",
    note: "Seasonal Special",
    ghostColor: "rgba(255,255,255,0.018)",
    accentColor: "rgba(220,200,160,0.72)",
    glowColor: "rgba(200,180,130,0.05)",
  },
];

export default function SignaturePizzasSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const headingRef  = useRef<HTMLDivElement>(null);
  const rowsRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      /* Section heading */
      gsap.fromTo(
        headingRef.current,
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1, y: 0, duration: 1.4, ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 72%" },
        }
      );

      /* Each pizza row reveals individually */
      const rows = rowsRef.current?.querySelectorAll<HTMLElement>(".pz-row");
      rows?.forEach((row) => {
        gsap.fromTo(
          row,
          { autoAlpha: 0, y: 50 },
          {
            autoAlpha: 1, y: 0, duration: 1.4, ease: "power3.out",
            scrollTrigger: { trigger: row, start: "top 82%" },
          }
        );
      });

      /* Separator lines draw in after the row */
      const lines = rowsRef.current?.querySelectorAll<HTMLElement>(".pz-line");
      lines?.forEach((line) => {
        gsap.fromTo(
          line,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1, duration: 1.0, ease: "power2.out",
            scrollTrigger: { trigger: line, start: "top 88%" },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      data-pizza-section="pizzas"
      ref={sectionRef}
      style={{
        position: "relative",
        background: "#080808",
        padding: "clamp(6rem, 12vw, 14rem) clamp(1.5rem, 8vw, 8rem)",
        overflow: "hidden",
      }}
    >
      {/* Ambient warm glow from top — oven light overhead */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "88%", height: "45%",
          background:
            "radial-gradient(ellipse at top center, rgba(249,115,22,0.07) 0%, rgba(251,191,36,0.03) 42%, transparent 68%)",
          pointerEvents: "none",
        }}
      />

      {/* Section heading */}
      <div
        ref={headingRef}
        style={{
          marginBottom: "clamp(3.5rem, 7vw, 7rem)",
          opacity: 0,
        }}
      >
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "0.48rem",
            letterSpacing: "0.52em",
            textTransform: "uppercase",
            color: "rgba(251,191,36,0.38)",
            marginBottom: "1.3rem",
          }}
        >
          The Creation
        </span>
        <h2
          style={{
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "clamp(1.9rem, 4.5vw, 5rem)",
            fontWeight: 300,
            letterSpacing: "0.03em",
            color: "#ffffff",
            lineHeight: 1.08,
          }}
        >
          Signature Pizzas
        </h2>
      </div>

      {/* Pizza editorial rows */}
      <div ref={rowsRef} style={{ maxWidth: 1200, margin: "0 auto" }}>
        {PIZZAS.map((pizza) => (
          <div key={pizza.name}>
            {/* Row wrapper */}
            <article
              className="pz-row"
              style={{
                position: "relative",
                opacity: 0,
                paddingTop: "clamp(2.5rem, 5vw, 5rem)",
                paddingBottom: "clamp(2.5rem, 5vw, 5rem)",
                overflow: "hidden",
              }}
            >
              {/* Ghost numeral background — layered depth */}
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-0.06em",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontFamily: "var(--font-cinematic, serif)",
                  fontSize: "clamp(18vw, 26vw, 34vw)",
                  fontWeight: 300,
                  color: pizza.ghostColor,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {pizza.roman}
              </span>

              {/* Subtle radial glow per pizza */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(ellipse 60% 80% at 50% 50%, ${pizza.glowColor} 0%, transparent 65%)`,
                  pointerEvents: "none",
                }}
              />

              {/* Content — relative so it sits above ghost */}
              <div style={{ position: "relative", zIndex: 2 }}>
                {/* Top row: number + badge + price */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "clamp(0.6rem, 1.2vw, 1rem)",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-cinematic, serif)",
                      fontSize: "0.52rem",
                      letterSpacing: "0.46em",
                      textTransform: "uppercase",
                      color: pizza.accentColor,
                      opacity: 0.72,
                    }}
                  >
                    {pizza.number} — {pizza.badge}
                  </span>

                  <span
                    style={{
                      fontFamily: "var(--font-cinematic, serif)",
                      fontSize: "clamp(1.2rem, 2.2vw, 1.8rem)",
                      fontWeight: 400,
                      color: pizza.accentColor,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {pizza.price}
                  </span>
                </div>

                {/* Pizza name — the film title */}
                <h3
                  style={{
                    fontFamily: "var(--font-cinematic, serif)",
                    fontSize: "clamp(2.2rem, 5.5vw, 6.5rem)",
                    fontWeight: 300,
                    color: "#ffffff",
                    letterSpacing: "0.01em",
                    lineHeight: 1.02,
                    marginBottom: "clamp(0.5rem, 1vw, 0.9rem)",
                  }}
                >
                  {pizza.name}
                </h3>

                {/* Note */}
                <p
                  style={{
                    fontFamily: "var(--font-cinematic, serif)",
                    fontSize: "0.52rem",
                    letterSpacing: "0.38em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.18)",
                    marginBottom: "clamp(1rem, 2vw, 1.8rem)",
                  }}
                >
                  {pizza.note}
                </p>

                {/* Description */}
                <p
                  style={{
                    fontFamily: "var(--font-cinematic, serif)",
                    fontSize: "clamp(0.82rem, 1.2vw, 1rem)",
                    color: "rgba(161,161,170,0.5)",
                    lineHeight: 1.85,
                    maxWidth: "68ch",
                  }}
                >
                  {pizza.description}
                </p>
              </div>
            </article>

            {/* Cinematic separator line */}
            <div
              className="pz-line"
              style={{
                height: "1px",
                background: `linear-gradient(to right, ${pizza.accentColor.replace(/[\d.]+\)$/, "0.18)")}, rgba(255,255,255,0.04) 40%, transparent)`,
                transformOrigin: "left center",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
