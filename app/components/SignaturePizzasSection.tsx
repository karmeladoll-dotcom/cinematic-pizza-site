"use client";

import { useEffect, useRef, type CSSProperties, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import FoodCursor from "./FoodCursor";

/**
 * Signature Pizzas — editorial menu list.
 *
 * Hand-off from the narrative stage: this section has margin-top: -100vh and a
 * soft gradient top edge, so it RISES OVER the pinned last video (curtain) instead
 * of cutting to a black screen.
 *
 * Each pizza is a full-width "film frame": outlined ghost numeral with parallax,
 * accent bar, masked title reveal, price with glow, key-ingredient tags, and a
 * mouse-following light on hover.
 */

const PIZZAS = [
  {
    roman: "I",
    number: "01",
    name: "Margherita D.O.C.",
    badge: "Signature",
    description:
      "San Marzano tomato, Fior di Latte, aged Parmigiano Reggiano, Genovese basil, Sicilian extra-virgin olive oil. The original. Unrepeatable.",
    tags: ["San Marzano", "Fior di Latte", "Genovese basil"],
    price: "€ 22",
    note: "Neapolitan Classic",
    accentColor: "rgba(251,191,36,0.92)",
    glowColor: "rgba(251,191,36,0.13)",
    spotColor: "rgba(251,191,36,0.16)",
  },
  {
    roman: "II",
    number: "02",
    name: "Diavola Calabrese",
    badge: "Chef's Pick",
    description:
      "Crushed San Marzano, Fior di Latte, spicy Calabrian salami, hand-pressed Nduja, chilli-infused oil, fresh wild oregano.",
    tags: ["Calabrian salami", "Nduja", "Chilli oil"],
    price: "€ 26",
    note: "Spicy & Bold",
    accentColor: "rgba(249,115,22,0.95)",
    glowColor: "rgba(239,68,34,0.14)",
    spotColor: "rgba(249,90,22,0.18)",
  },
  {
    roman: "III",
    number: "03",
    name: "Tartufo Nero",
    badge: "Premium",
    description:
      "Truffle cream base, Fior di Latte, shaved Périgord black truffle, wild porcini, aged Pecorino Romano, white truffle finishing oil.",
    tags: ["Périgord truffle", "Wild porcini", "Pecorino Romano"],
    tool: "knife", // shaving the truffle
    price: "€ 38",
    note: "Seasonal Special",
    accentColor: "rgba(232,214,170,0.95)",
    glowColor: "rgba(214,190,130,0.11)",
    spotColor: "rgba(232,214,170,0.14)",
  },
];

/** Menu photos generated in Canva (1600px originals archived in Second Brain\FORNO_NERO\pizze_canva_1600). */
const IMAGES: Record<string, { src: string; alt: string }> = {
  "Margherita D.O.C.": {
    src: "/pizzas/margherita.webp",
    alt: "Neapolitan Margherita D.O.C. with charred crust, tomato, fior di latte and basil",
  },
  "Diavola Calabrese": {
    src: "/pizzas/diavola.webp",
    alt: "Diavola Calabrese pizza with Calabrian salami and nduja",
  },
  "Tartufo Nero": {
    src: "/pizzas/tartufo.webp",
    alt: "Tartufo Nero pizza with shaved black truffle and porcini",
  },
};

const CSS = `
.pz-row .pz-spot{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .6s ease;
  background:radial-gradient(circle 420px at var(--mx,50%) var(--my,50%), var(--spot), transparent 70%)}
.pz-row:hover .pz-spot{opacity:1}
.pz-row .pz-name{display:inline-block;transition:color .5s ease, letter-spacing .7s ease}
.pz-row:hover .pz-name{color:var(--acc);letter-spacing:.025em}
.pz-row .pz-price{transition:text-shadow .5s ease}
.pz-row:hover .pz-price{text-shadow:0 0 30px var(--acc)}
.pz-row .pz-tag{transition:border-color .5s ease,color .5s ease}
.pz-row:hover .pz-tag{border-color:var(--acc);color:#fff}
.pz-row .pz-pizza{position:absolute;right:clamp(0rem,1.5vw,1.5rem);top:50%;width:min(32vw,470px);aspect-ratio:1;margin-top:calc(min(32vw,470px) / -2);pointer-events:none;z-index:1}
.pz-row .pz-pizza-glow{position:absolute;inset:-12%;border-radius:50%;filter:blur(30px);opacity:.55}
.pz-row .pz-pizza-spin{position:absolute;inset:0;
  -webkit-mask-image:radial-gradient(circle closest-side,#000 90%,transparent 100%);
  mask-image:radial-gradient(circle closest-side,#000 90%,transparent 100%);
  filter:drop-shadow(0 18px 36px rgba(0,0,0,.65))}
.pz-row .pz-content{max-width:58%}
@media (max-width: 767px){
  .pz-row .pz-pizza{position:relative;right:auto;top:auto;margin:0 auto 1.4rem;width:min(78vw,380px)}
  .pz-row .pz-content{max-width:100%}
}
@media (prefers-reduced-motion: reduce){
  .pz-row .pz-name,.pz-row .pz-price,.pz-row .pz-tag,.pz-row .pz-spot{transition:none}
}
`;

export default function SignaturePizzasSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      /* Section heading */
      gsap.fromTo(
        headingRef.current,
        { autoAlpha: 0, y: reduced ? 0 : 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 88%" },
        }
      );

      const rows = rowsRef.current?.querySelectorAll<HTMLElement>(".pz-row");
      rows?.forEach((row) => {
        const q = (sel: string) => row.querySelectorAll<HTMLElement>(sel);
        const rise = reduced ? 0 : 1;

        /* staggered reveal */
        const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 82%" } });
        tl.fromTo(row, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: "power2.out" }, 0)
          .fromTo(
            q(".pz-bar"),
            { scaleY: 0, transformOrigin: "top center" },
            { scaleY: 1, duration: 1.1, ease: "power3.out" },
            0
          )
          .fromTo(
            q(".pz-name"),
            { yPercent: 105 * rise },
            { yPercent: 0, duration: 1.15, ease: "power4.out" },
            0.1
          )
          .fromTo(
            q(".pz-pizza"),
            { autoAlpha: 0, scale: reduced ? 1 : 0.78 },
            { autoAlpha: 1, scale: 1, duration: 1.5, ease: "power3.out" },
            0.05
          )
          .fromTo(
            q(".pz-meta"),
            { autoAlpha: 0, y: 10 * rise },
            { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" },
            0.2
          )
          .fromTo(
            q(".pz-price"),
            { autoAlpha: 0, x: 26 * rise },
            { autoAlpha: 1, x: 0, duration: 0.9, ease: "power3.out" },
            0.3
          )
          .fromTo(
            q(".pz-desc"),
            { autoAlpha: 0, y: 16 * rise },
            { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out" },
            0.45
          )
          .fromTo(
            q(".pz-tag"),
            { autoAlpha: 0, y: 10 * rise },
            { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.09 },
            0.6
          );

        /* the pizza turns slowly as you scroll past, like a plate on a turntable */
        if (!reduced) {
          gsap.fromTo(
            q(".pz-pizza-spin"),
            { rotation: -22 },
            {
              rotation: 22,
              ease: "none",
              scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true },
            }
          );
        }

        /* ghost numeral drifts slower than the page (depth) */
        if (!reduced) {
          gsap.fromTo(
            q(".pz-ghost"),
            { yPercent: -36 },
            {
              yPercent: -64,
              ease: "none",
              scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true },
            }
          );
        } else {
          gsap.set(q(".pz-ghost"), { yPercent: -50 });
        }
      });

      /* Separator lines draw in after the row */
      rowsRef.current?.querySelectorAll<HTMLElement>(".pz-line").forEach((line) => {
        gsap.fromTo(
          line,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            duration: 1.1,
            ease: "power2.out",
            scrollTrigger: { trigger: line, start: "top 90%" },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* mouse-following light */
  const onMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section
      data-pizza-section="pizzas"
      ref={sectionRef}
      style={{
        position: "relative",
        zIndex: 5,
        /* curtain: rise over the pinned stage; soft top edge instead of a hard cut */
        marginTop: "-100vh",
        background:
          "linear-gradient(to bottom, rgba(8,8,8,0) 0, rgba(8,8,8,0.55) 12vh, rgba(8,8,8,0.92) 26vh, #080808 36vh)",
        padding: "calc(30vh + 3rem) clamp(1.5rem, 8vw, 8rem) clamp(6rem, 12vw, 14rem)",
        overflow: "hidden",
      }}
    >
      <style>{CSS}</style>
      <FoodCursor zoneRef={sectionRef} />

      {/* Ambient warm glow from top — oven light overhead */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "88%",
          height: "45%",
          background:
            "radial-gradient(ellipse at top center, rgba(249,115,22,0.10) 0%, rgba(251,191,36,0.04) 42%, transparent 68%)",
          pointerEvents: "none",
        }}
      />

      {/* Section heading */}
      <div
        ref={headingRef}
        style={{
          position: "relative",
          marginBottom: "clamp(3.5rem, 7vw, 7rem)",
          opacity: 0,
        }}
      >
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "0.5rem",
            letterSpacing: "0.52em",
            textTransform: "uppercase",
            color: "rgba(251,191,36,0.6)",
            marginBottom: "1.3rem",
          }}
        >
          The Menu
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
      <div ref={rowsRef} style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
        {PIZZAS.map((pizza) => (
          <div key={pizza.name}>
            <article
              className="pz-row"
              data-tool={"tool" in pizza ? pizza.tool : "fork"}
              onMouseMove={onMove}
              style={
                {
                  position: "relative",
                  opacity: 0,
                  paddingTop: "clamp(3rem, 6vw, 6rem)",
                  paddingBottom: "clamp(3rem, 6vw, 6rem)",
                  paddingLeft: "clamp(1.1rem, 2.4vw, 2.2rem)",
                  overflow: "hidden",
                  "--acc": pizza.accentColor,
                  "--spot": pizza.spotColor,
                } as CSSProperties
              }
            >
              {/* accent bar */}
              <div
                className="pz-bar"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 0,
                  top: "clamp(3rem, 6vw, 6rem)",
                  bottom: "clamp(3rem, 6vw, 6rem)",
                  width: 2,
                  background: `linear-gradient(to bottom, ${pizza.accentColor}, transparent)`,
                }}
              />

              {/* Ghost numeral — outlined, drifts with parallax */}
              <span
                className="pz-ghost"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  right: "-0.02em",
                  top: "50%",
                  fontFamily: "var(--font-cinematic, serif)",
                  fontSize: "clamp(18vw, 26vw, 34vw)",
                  fontWeight: 300,
                  color: "transparent",
                  WebkitTextStroke: `1px ${pizza.accentColor.replace(/[\d.]+\)$/, "0.16)")}`,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {pizza.roman}
              </span>

              {/* Pizza photo (Canva) — glow, masked round edge, scroll-driven spin */}
              <div className="pz-pizza">
                <div
                  className="pz-pizza-glow"
                  aria-hidden="true"
                  style={{
                    background: `radial-gradient(circle, ${pizza.accentColor.replace(/[\d.]+\)$/, "0.5)")} 0%, transparent 66%)`,
                  }}
                />
                <div className="pz-pizza-spin">
                  <Image
                    src={IMAGES[pizza.name].src}
                    alt={IMAGES[pizza.name].alt}
                    width={1100}
                    height={1100}
                    sizes="(max-width: 767px) 78vw, 32vw"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </div>

              {/* Static radial glow per pizza */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(ellipse 60% 80% at 40% 50%, ${pizza.glowColor} 0%, transparent 65%)`,
                  pointerEvents: "none",
                }}
              />

              {/* Mouse-following light */}
              <div className="pz-spot" aria-hidden="true" />

              <div className="pz-content" style={{ position: "relative", zIndex: 2 }}>
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
                    className="pz-meta"
                    style={{
                      fontFamily: "var(--font-cinematic, serif)",
                      fontSize: "0.58rem",
                      letterSpacing: "0.46em",
                      textTransform: "uppercase",
                      color: pizza.accentColor,
                    }}
                  >
                    {pizza.number} — {pizza.badge}
                  </span>

                  <span
                    className="pz-price"
                    style={{
                      fontFamily: "var(--font-cinematic, serif)",
                      fontSize: "clamp(1.5rem, 2.8vw, 2.4rem)",
                      fontWeight: 400,
                      color: pizza.accentColor,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {pizza.price}
                  </span>
                </div>

                {/* Pizza name — the film title (masked reveal) */}
                <div style={{ overflow: "hidden", paddingBottom: "0.12em" }}>
                  <h3
                    className="pz-name"
                    style={{
                      fontFamily: "var(--font-cinematic, serif)",
                      fontSize: "clamp(2.2rem, 5.5vw, 6.5rem)",
                      fontWeight: 300,
                      color: "#ffffff",
                      letterSpacing: "0.01em",
                      lineHeight: 1.05,
                    }}
                  >
                    {pizza.name}
                  </h3>
                </div>

                {/* Note */}
                <p
                  className="pz-meta"
                  style={{
                    fontFamily: "var(--font-cinematic, serif)",
                    fontSize: "0.58rem",
                    letterSpacing: "0.38em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.5)",
                    margin: "0.5rem 0 clamp(1rem, 2vw, 1.8rem)",
                  }}
                >
                  {pizza.note}
                </p>

                {/* Description */}
                <p
                  className="pz-desc"
                  style={{
                    fontFamily: "var(--font-cinematic, serif)",
                    fontSize: "clamp(0.9rem, 1.3vw, 1.1rem)",
                    color: "rgba(228,228,231,0.74)",
                    lineHeight: 1.85,
                    maxWidth: "62ch",
                  }}
                >
                  {pizza.description}
                </p>

                {/* Key ingredients */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.6rem",
                    marginTop: "clamp(1rem, 2vw, 1.6rem)",
                  }}
                >
                  {pizza.tags.map((t) => (
                    <span
                      key={t}
                      className="pz-tag"
                      style={{
                        fontFamily: "var(--font-cinematic, serif)",
                        fontSize: "0.58rem",
                        letterSpacing: "0.3em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.72)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        padding: "0.5rem 0.95rem",
                        borderRadius: 999,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </article>

            {/* Cinematic separator line */}
            <div
              className="pz-line"
              style={{
                height: "1px",
                background: `linear-gradient(to right, ${pizza.accentColor.replace(/[\d.]+\)$/, "0.4)")}, rgba(255,255,255,0.06) 45%, transparent)`,
                transformOrigin: "left center",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
