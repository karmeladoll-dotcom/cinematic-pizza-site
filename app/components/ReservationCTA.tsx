"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FoodCursor from "./FoodCursor";

/**
 * Reservation finale — "Ready to Taste It?"
 *
 * Bookends the opening: the oven fire from the first chapter comes back, dimmed,
 * and FADES IN out of the menu's darkness (no hard line / colour edge). The
 * headline ignites letter by letter like sparks catching, embers rise, and the
 * button glows. Reduced-motion users get plain fades.
 */

const LINE_1 = "Ready to";
const LINE_2 = "Taste It?";

/** Fixed (not random) so server and client render the same markup. */
const EMBERS = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 37 + 11) % 96}%`,
  size: 2 + ((i * 5) % 4),
  dur: 6.5 + ((i * 7) % 6),
  delay: -((i * 3.1) % 9),
  dx: ((i * 29) % 60) - 30,
}));

function Letters({ text }: { text: string }) {
  return (
    <>
      {text.split("").map((ch, i) =>
        ch === " " ? (
          <span key={i} aria-hidden="true" style={{ display: "inline-block", width: "0.28em" }} />
        ) : (
          <span key={i} className="cta-letter" aria-hidden="true" style={{ display: "inline-block" }}>
            {ch}
          </span>
        )
      )}
    </>
  );
}

export default function ReservationCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const section = sectionRef.current!;
      const letters1 = gsap.utils.toArray<HTMLElement>(".cta-l1 .cta-letter", section);
      const letters2 = gsap.utils.toArray<HTMLElement>(".cta-l2 .cta-letter", section);
      const all = [...letters1, ...letters2];
      const rest = gsap.utils.toArray<HTMLElement>(".cta-item", section);

      const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: "top 55%" } });

      if (reduced) {
        tl.fromTo([...all, ...rest], { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, stagger: 0.05 });
      } else {
        /* sparks catch: letters rise out of blur and flare, then cool to white / amber */
        tl.fromTo(
          all,
          { autoAlpha: 0, y: 70, rotateX: -70, filter: "blur(10px)", transformPerspective: 700 },
          { autoAlpha: 1, y: 0, rotateX: 0, filter: "blur(0px)", duration: 1.15, ease: "power3.out", stagger: 0.045 },
          0
        );
        tl.fromTo(
          all,
          { textShadow: "0 0 36px rgba(251,191,36,1), 0 0 90px rgba(249,115,22,0.9)" },
          { textShadow: "0 0 0px rgba(251,191,36,0)", duration: 1.8, ease: "power2.out", stagger: 0.045 },
          0.1
        );
        tl.fromTo(
          rest,
          { autoAlpha: 0, y: 36 },
          { autoAlpha: 1, y: 0, duration: 1.2, ease: "power2.out", stagger: 0.18 },
          0.7
        );

        /* idle: a slow glow wave runs through the amber words */
        tl.add(() => {
          gsap.to(letters2, {
            textShadow: "0 0 30px rgba(251,191,36,0.6)",
            duration: 1.6,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            stagger: { each: 0.12, repeat: -1, yoyo: true },
          });
        }, 2.4);
      }
    }, sectionRef);

    /* play the fire only while the finale is on screen */
    const video = videoRef.current;
    let io: IntersectionObserver | undefined;
    if (video) {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        },
        { rootMargin: "120px 0px" }
      );
      io.observe(sectionRef.current!);
    }

    return () => {
      io?.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="reservation"
      data-pizza-section="reservation"
      ref={sectionRef}
      style={{
        position: "relative",
        /* same colour as the end of the menu section → no visible seam */
        background: "#080808",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(7rem, 14vw, 16rem) clamp(1.5rem, 8vw, 8rem)",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      <FoodCursor zoneRef={sectionRef} />

      <style>{`
        @keyframes emberRise {
          0%   { opacity: 0;   transform: translate3d(0, 0, 0) scale(1); }
          12%  { opacity: .95; }
          70%  { opacity: .55; }
          100% { opacity: 0;   transform: translate3d(var(--dx), -78vh, 0) scale(.3); }
        }
        @keyframes finaleBreath {
          0%, 100% { opacity: .72; }
          50%      { opacity: 1; }
        }
        .cta-embers span { animation-name: emberRise; animation-timing-function: ease-out; animation-iteration-count: infinite; }
        @media (prefers-reduced-motion: reduce) {
          .cta-embers { display: none; }
        }
      `}</style>

      {/* ── The oven fire returns (dim), fading in from the menu's darkness ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 26%, #000 48%, #000 72%, rgba(0,0,0,0.35) 92%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 26%, #000 48%, #000 72%, rgba(0,0,0,0.35) 92%, transparent 100%)",
          pointerEvents: "none",
        }}
      >
        <video
          ref={videoRef}
          src="/videos/oven.mp4"
          muted
          loop
          playsInline
          preload="metadata"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.42,
            filter: "saturate(1.1) contrast(1.05)",
          }}
        />
      </div>

      {/* vignette keeps the text readable */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 70% 60% at 50% 52%, rgba(8,8,8,0.15) 0%, rgba(8,8,8,0.55) 55%, rgba(8,8,8,0.92) 100%)",
        }}
      />

      {/* breathing amber glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 60% 45% at 50% 62%, rgba(249,115,22,0.16) 0%, rgba(251,191,36,0.06) 40%, transparent 70%)",
          animation: "finaleBreath 4.5s ease-in-out infinite",
        }}
      />

      {/* rising embers */}
      <div
        className="cta-embers"
        aria-hidden="true"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "100%", pointerEvents: "none" }}
      >
        {EMBERS.map((e, i) => (
          <span
            key={i}
            style={
              {
                position: "absolute",
                bottom: "-2%",
                left: e.left,
                width: e.size,
                height: e.size,
                borderRadius: "50%",
                background: "rgb(251,191,36)",
                boxShadow: "0 0 10px 2px rgba(249,115,22,0.8)",
                opacity: 0,
                animationDuration: `${e.dur}s`,
                animationDelay: `${e.delay}s`,
                "--dx": `${e.dx}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* ── Content ── */}
      <div ref={itemsRef} style={{ position: "relative", zIndex: 2 }}>
        <span
          className="cta-item"
          style={{
            display: "block",
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "0.62rem",
            letterSpacing: "0.55em",
            textTransform: "uppercase",
            color: "rgba(251,191,36,0.75)",
            marginBottom: "2.2rem",
            opacity: 0,
          }}
        >
          Your Table Awaits
        </span>

        <h2
          aria-label="Ready to Taste It?"
          style={{
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "clamp(2.8rem, 8vw, 9.5rem)",
            fontWeight: 300,
            color: "#ffffff",
            letterSpacing: "0.03em",
            lineHeight: 1.0,
            marginBottom: "2.8rem",
          }}
        >
          <span className="cta-l1" style={{ display: "block" }}>
            <Letters text={LINE_1} />
          </span>
          <span
            className="cta-l2"
            style={{ display: "block", fontStyle: "italic", color: "rgba(251,191,36,0.95)" }}
          >
            <Letters text={LINE_2} />
          </span>
        </h2>

        <p
          className="cta-item"
          style={{
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "clamp(0.9rem, 1.4vw, 1.12rem)",
            color: "rgba(228,228,231,0.66)",
            maxWidth: 500,
            margin: "0 auto 3.8rem",
            lineHeight: 1.95,
            letterSpacing: "0.02em",
            opacity: 0,
          }}
        >
          Seventeen covers each evening. Tables open thirty days in advance.
        </p>

        <div className="cta-item" style={{ opacity: 0 }}>
          <a
            href="mailto:reservations@fornonero.com"
            style={{
              display: "inline-block",
              fontFamily: "var(--font-cinematic, serif)",
              fontSize: "0.66rem",
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: "#050505",
              background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
              padding: "1.2rem 3.4rem",
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
