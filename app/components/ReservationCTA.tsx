"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ReservationCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const items = itemsRef.current?.querySelectorAll<HTMLElement>(".cta-item");
      if (items?.length) {
        gsap.fromTo(
          Array.from(items),
          { autoAlpha: 0, y: 45 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.4,
            ease: "power2.out",
            stagger: 0.18,
            scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="reserve"
      ref={sectionRef}
      style={{
        position: "relative",
        background: "#060606",
        padding: "clamp(7rem, 14vw, 18rem) clamp(1.5rem, 8vw, 8rem)",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Ambient radial glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(251,191,36,0.06) 0%, rgba(249,115,22,0.035) 35%, transparent 68%)",
          pointerEvents: "none",
        }}
      />

      {/* Top border accent */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: "1px",
          background:
            "linear-gradient(to right, transparent, rgba(251,191,36,0.2), transparent)",
          pointerEvents: "none",
        }}
      />

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
          <em
            style={{
              fontStyle: "italic",
              color: "rgba(251,191,36,0.92)",
            }}
          >
            Experience
          </em>
        </h2>

        {/* Supporting text */}
        <p
          className="cta-item"
          style={{
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "clamp(0.82rem, 1.4vw, 1.08rem)",
            color: "rgba(161,161,170,0.45)",
            maxWidth: 500,
            margin: "0 auto 3.8rem",
            lineHeight: 1.9,
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
