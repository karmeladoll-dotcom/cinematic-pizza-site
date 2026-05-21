"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const INGREDIENTS = [
  {
    icon: "◎",
    name: "San Marzano Tomatoes",
    origin: "Campania, Italy",
    description:
      "Grown in the volcanic soil at the foot of Mount Vesuvius. Sweeter, less acidic, with a dense, fleshy pulp that forms the soul of our sauce.",
    badge: "D.O.P. Certified",
  },
  {
    icon: "◈",
    name: "Fior Di Latte Mozzarella",
    origin: "Agerola, Italy",
    description:
      "Hand-pulled every morning from the milk of local cattle. Delicate and creamy, with a silken texture that melts into ribbons of silk across the heat.",
    badge: "Fresh Daily",
  },
  {
    icon: "◇",
    name: "Fresh Basil",
    origin: "Genoese Highlands",
    description:
      "Harvested at the peak of the summer season. Fragrant and peppery, with sweet floral top notes that define the character of true Neapolitan cuisine.",
    badge: "Seasonal Harvest",
  },
];

export default function IngredientsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const parallaxGlowRef = useRef<HTMLDivElement>(null);
  const leaf1Ref = useRef<HTMLSpanElement>(null);
  const leaf2Ref = useRef<HTMLSpanElement>(null);

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

      const cards = cardsRef.current?.querySelectorAll<HTMLElement>(".ing-card");
      if (cards?.length) {
        gsap.fromTo(
          Array.from(cards),
          { autoAlpha: 0, y: 55 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.2,
            ease: "power2.out",
            stagger: 0.14,
            scrollTrigger: { trigger: cardsRef.current, start: "top 75%" },
          }
        );
      }

      // Parallax drift on the ambient glow
      if (parallaxGlowRef.current) {
        gsap.fromTo(
          parallaxGlowRef.current,
          { y: 32 },
          {
            y: -32,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 2.5,
            },
          }
        );
      }

      // Basil leaves fade + float in when section enters view
      const leafTrigger = { trigger: sectionRef.current, start: "top 65%", once: true };
      if (leaf1Ref.current) {
        gsap.fromTo(
          leaf1Ref.current,
          { autoAlpha: 0, y: 18, rotation: -35 },
          { autoAlpha: 1, y: 0, duration: 2.2, ease: "power1.out", scrollTrigger: leafTrigger }
        );
        // Continuous organic drift
        gsap.to(leaf1Ref.current, {
          y: "+=10",
          x: "+=6",
          rotation: "-=7",
          duration: 4.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.5,
        });
      }
      if (leaf2Ref.current) {
        gsap.fromTo(
          leaf2Ref.current,
          { autoAlpha: 0, y: 22, rotation: 22 },
          { autoAlpha: 1, y: 0, duration: 2.5, ease: "power1.out", delay: 0.35, scrollTrigger: leafTrigger }
        );
        gsap.to(leaf2Ref.current, {
          y: "+=8",
          x: "-=5",
          rotation: "+=6",
          duration: 5.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1.2,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="menu"
      data-pizza-section="ingredients"
      ref={sectionRef}
      style={{
        position: "relative",
        background: "#060606",
        padding: "clamp(5rem, 10vw, 13rem) clamp(1.5rem, 8vw, 8rem)",
        overflow: "hidden",
      }}
    >
      {/* Subtle top border glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: "1px",
          background:
            "linear-gradient(to right, transparent, rgba(251,191,36,0.18), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* Warm ambient glow — parallaxes for depth */}
      <div
        ref={parallaxGlowRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70%",
          height: "60%",
          pointerEvents: "none",
          willChange: "transform",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(ellipse at center, rgba(34,118,52,0.04) 0%, rgba(251,191,36,0.035) 45%, transparent 72%)",
          }}
        />
      </div>

      {/* Drifting basil leaf silhouettes — desktop only */}
      <span
        ref={leaf1Ref}
        aria-hidden="true"
        className="ing-leaf"
        style={{
          position: "absolute",
          top: "12%",
          right: "7%",
          width: 38,
          height: 19,
          borderRadius: "60% 40% 60% 40% / 70% 30% 70% 30%",
          background: "rgba(34, 118, 52, 0.20)",
          transform: "rotate(-35deg)",
          mixBlendMode: "screen",
          filter: "blur(0.5px)",
          pointerEvents: "none",
          opacity: 0,
        }}
      />
      <span
        ref={leaf2Ref}
        aria-hidden="true"
        className="ing-leaf"
        style={{
          position: "absolute",
          bottom: "15%",
          left: "6%",
          width: 28,
          height: 14,
          borderRadius: "60% 40% 60% 40% / 70% 30% 70% 30%",
          background: "rgba(34, 118, 52, 0.15)",
          transform: "rotate(22deg)",
          mixBlendMode: "screen",
          filter: "blur(0.4px)",
          pointerEvents: "none",
          opacity: 0,
        }}
      />
      <style>{`
        @media (max-width: 767px) { .ing-leaf { display: none !important; } }
      `}</style>

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
            color: "rgba(251,191,36,0.6)",
            marginBottom: "1.3rem",
          }}
        >
          The Craft
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
          Premium Ingredients
        </h2>
      </div>

      {/* Cards grid */}
      <div
        ref={cardsRef}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {INGREDIENTS.map((ing) => (
          <div
            key={ing.name}
            className="ing-card"
            style={{
              opacity: 0,
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              padding: "2.8rem 2.2rem",
              transition: "all 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(251,191,36,0.045)";
              el.style.borderColor = "rgba(251,191,36,0.22)";
              el.style.boxShadow =
                "0 0 70px rgba(251,191,36,0.07), 0 8px 40px rgba(0,0,0,0.5)";
              el.style.transform = "translateY(-5px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(255,255,255,0.025)";
              el.style.borderColor = "rgba(255,255,255,0.07)";
              el.style.boxShadow = "none";
              el.style.transform = "translateY(0)";
            }}
          >
            {/* Icon */}
            <span
              style={{
                display: "block",
                fontSize: "1.4rem",
                color: "rgba(251,191,36,0.45)",
                marginBottom: "1.8rem",
                letterSpacing: "0",
              }}
            >
              {ing.icon}
            </span>

            {/* Name */}
            <h3
              style={{
                fontFamily: "var(--font-cinematic, serif)",
                fontSize: "clamp(1.1rem, 1.9vw, 1.45rem)",
                fontWeight: 400,
                color: "#ffffff",
                letterSpacing: "0.02em",
                marginBottom: "0.5rem",
                lineHeight: 1.2,
              }}
            >
              {ing.name}
            </h3>

            {/* Origin */}
            <p
              style={{
                fontFamily: "var(--font-cinematic, serif)",
                fontSize: "0.58rem",
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: "rgba(251,191,36,0.48)",
                marginBottom: "1.4rem",
              }}
            >
              {ing.origin}
            </p>

            {/* Description */}
            <p
              style={{
                fontFamily: "var(--font-cinematic, serif)",
                fontSize: "clamp(0.78rem, 1.15vw, 0.95rem)",
                color: "rgba(161,161,170,0.62)",
                lineHeight: 1.8,
                marginBottom: "2rem",
              }}
            >
              {ing.description}
            </p>

            {/* Badge */}
            <span
              style={{
                display: "inline-block",
                fontFamily: "var(--font-cinematic, serif)",
                fontSize: "0.52rem",
                letterSpacing: "0.42em",
                textTransform: "uppercase",
                color: "rgba(251,191,36,0.38)",
                borderTop: "1px solid rgba(251,191,36,0.14)",
                paddingTop: "0.9rem",
                width: "100%",
              }}
            >
              {ing.badge}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
