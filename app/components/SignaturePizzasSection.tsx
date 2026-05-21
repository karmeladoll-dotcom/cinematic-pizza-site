"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const PIZZAS = [
  {
    number: "01",
    name: "Margherita D.O.C.",
    badge: "Signature",
    description:
      "San Marzano tomato, Fior di Latte, aged Parmigiano Reggiano, Genovese basil, Sicilian extra-virgin olive oil. The original. Unrepeatable.",
    price: "€ 22",
    note: "Neapolitan Classic",
  },
  {
    number: "02",
    name: "Diavola Calabrese",
    badge: "Chef's Pick",
    description:
      "Crushed San Marzano, Fior di Latte, spicy Calabrian salami, hand-pressed Nduja, chilli-infused oil, fresh wild oregano.",
    price: "€ 26",
    note: "Spicy & Bold",
  },
  {
    number: "03",
    name: "Tartufo Nero",
    badge: "Premium",
    description:
      "Truffle cream base, Fior di Latte, shaved Périgord black truffle, wild porcini, aged Pecorino Romano, white truffle finishing oil.",
    price: "€ 38",
    note: "Seasonal Special",
  },
];

export default function SignaturePizzasSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.3,
          ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        }
      );

      const cards = cardsRef.current?.querySelectorAll<HTMLElement>(".pizza-card");
      if (cards?.length) {
        gsap.fromTo(
          Array.from(cards),
          { autoAlpha: 0, y: 65 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.3,
            ease: "power3.out",
            stagger: 0.17,
            scrollTrigger: { trigger: cardsRef.current, start: "top 75%" },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-pizza-section="pizzas"
      style={{
        position: "relative",
        background: "#080808",
        padding: "clamp(5rem, 10vw, 13rem) clamp(1.5rem, 8vw, 8rem)",
        overflow: "hidden",
      }}
    >
      {/* Ambient warm glow from top */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          height: "50%",
          background:
            "radial-gradient(ellipse at top center, rgba(249,115,22,0.05) 0%, rgba(251,191,36,0.02) 40%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Section heading */}
      <div
        ref={headingRef}
        style={{ textAlign: "center", marginBottom: "clamp(3.5rem, 7vw, 7rem)", opacity: 0 }}
      >
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "0.58rem",
            letterSpacing: "0.52em",
            textTransform: "uppercase",
            color: "rgba(249,115,22,0.6)",
            marginBottom: "1.3rem",
          }}
        >
          The Selection
        </span>
        <h2
          style={{
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "clamp(1.9rem, 4.5vw, 4.5rem)",
            fontWeight: 300,
            letterSpacing: "0.04em",
            color: "#ffffff",
            lineHeight: 1.1,
          }}
        >
          Signature Pizzas
        </h2>
      </div>

      {/* Pizza cards */}
      <div
        ref={cardsRef}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {PIZZAS.map((pizza) => (
          <article
            key={pizza.name}
            className="pizza-card"
            style={{
              opacity: 0,
              position: "relative",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
              padding: "2.8rem 2.2rem 2.2rem",
              transition: "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              cursor: "default",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background =
                "linear-gradient(145deg, rgba(249,115,22,0.07) 0%, rgba(251,191,36,0.04) 100%)";
              el.style.borderColor = "rgba(249,115,22,0.28)";
              el.style.boxShadow =
                "0 24px 80px rgba(0,0,0,0.55), 0 0 50px rgba(249,115,22,0.07)";
              el.style.transform = "translateY(-7px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background =
                "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)";
              el.style.borderColor = "rgba(255,255,255,0.07)";
              el.style.boxShadow = "none";
              el.style.transform = "translateY(0)";
            }}
          >
            {/* Number */}
            <span
              style={{
                display: "block",
                fontFamily: "var(--font-cinematic, serif)",
                fontSize: "0.55rem",
                letterSpacing: "0.45em",
                color: "rgba(249,115,22,0.45)",
                marginBottom: "1.6rem",
              }}
            >
              {pizza.number}
            </span>

            {/* Badge */}
            <span
              style={{
                position: "absolute",
                top: "2.2rem",
                right: "2.2rem",
                fontFamily: "var(--font-cinematic, serif)",
                fontSize: "0.48rem",
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: "rgba(251,191,36,0.42)",
                border: "1px solid rgba(251,191,36,0.18)",
                padding: "0.32rem 0.7rem",
              }}
            >
              {pizza.badge}
            </span>

            {/* Title */}
            <h3
              style={{
                fontFamily: "var(--font-cinematic, serif)",
                fontSize: "clamp(1.3rem, 2.2vw, 1.75rem)",
                fontWeight: 400,
                color: "#ffffff",
                letterSpacing: "0.025em",
                marginBottom: "1rem",
                lineHeight: 1.15,
              }}
            >
              {pizza.name}
            </h3>

            {/* Description */}
            <p
              style={{
                fontFamily: "var(--font-cinematic, serif)",
                fontSize: "clamp(0.78rem, 1.15vw, 0.92rem)",
                color: "rgba(161,161,170,0.6)",
                lineHeight: 1.8,
                marginBottom: "2.2rem",
              }}
            >
              {pizza.description}
            </p>

            {/* Footer row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: "1.3rem",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-cinematic, serif)",
                  fontSize: "clamp(1rem, 1.8vw, 1.3rem)",
                  fontWeight: 400,
                  color: "rgba(251,191,36,0.82)",
                  letterSpacing: "0.04em",
                }}
              >
                {pizza.price}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-cinematic, serif)",
                  fontSize: "0.52rem",
                  letterSpacing: "0.38em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.18)",
                }}
              >
                {pizza.note}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
