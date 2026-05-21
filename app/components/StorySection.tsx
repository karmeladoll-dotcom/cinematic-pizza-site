"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function StorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const trigger = {
        trigger: sectionRef.current,
        start: "top 68%",
      };

      gsap.fromTo(
        lineRef.current,
        { scaleX: 0, autoAlpha: 0, transformOrigin: "center" },
        { scaleX: 1, autoAlpha: 1, duration: 1.4, ease: "power3.out", scrollTrigger: trigger }
      );

      gsap.fromTo(
        labelRef.current,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 1.1, ease: "power2.out", delay: 0.15, scrollTrigger: trigger }
      );

      gsap.fromTo(
        headingRef.current,
        { autoAlpha: 0, y: 70 },
        { autoAlpha: 1, y: 0, duration: 1.8, ease: "power3.out", delay: 0.25, scrollTrigger: trigger }
      );

      gsap.fromTo(
        subRef.current,
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 1.2, ease: "power2.out", delay: 0.55, scrollTrigger: trigger }
      );
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
        background: "#080808",
        padding: "clamp(7rem, 14vw, 16rem) clamp(1.5rem, 8vw, 8rem)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {/* Top gradient fade from black hero */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "30%",
          background: "linear-gradient(to bottom, #000 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Warm ambient center glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "75%",
          height: "70%",
          background:
            "radial-gradient(ellipse at center, rgba(251,191,36,0.07) 0%, rgba(249,115,22,0.04) 35%, transparent 68%)",
          pointerEvents: "none",
        }}
      />

      {/* Thin amber line */}
      <div
        ref={lineRef}
        style={{
          width: "clamp(44px, 6vw, 88px)",
          height: "1px",
          background:
            "linear-gradient(to right, transparent, rgba(251,191,36,0.65), transparent)",
          marginBottom: "2rem",
          opacity: 0,
        }}
      />

      {/* Label */}
      <span
        ref={labelRef}
        style={{
          display: "block",
          fontFamily: "var(--font-cinematic, serif)",
          fontSize: "0.58rem",
          letterSpacing: "0.55em",
          textTransform: "uppercase",
          color: "rgba(251,191,36,0.55)",
          marginBottom: "2.2rem",
          opacity: 0,
        }}
      >
        The Philosophy
      </span>

      {/* Main heading */}
      <h2
        ref={headingRef}
        style={{
          fontFamily: "var(--font-cinematic, serif)",
          fontSize: "clamp(2.2rem, 6vw, 6.5rem)",
          fontWeight: 300,
          letterSpacing: "0.02em",
          color: "#ffffff",
          maxWidth: "920px",
          lineHeight: 1.12,
          opacity: 0,
        }}
      >
        Crafted through fire,{" "}
        <em
          style={{
            fontStyle: "italic",
            color: "rgba(251,191,36,0.88)",
            fontWeight: 300,
          }}
        >
          patience
        </em>{" "}
        and obsession.
      </h2>

      {/* Sub text */}
      <p
        ref={subRef}
        style={{
          fontFamily: "var(--font-cinematic, serif)",
          fontSize: "clamp(0.62rem, 1.2vw, 0.82rem)",
          letterSpacing: "0.42em",
          textTransform: "uppercase",
          color: "rgba(161,161,170,0.42)",
          marginTop: "3rem",
          opacity: 0,
        }}
      >
        Naples · Italy · Est. 1987
      </p>
    </section>
  );
}
