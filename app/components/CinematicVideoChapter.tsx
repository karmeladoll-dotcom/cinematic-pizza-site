"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface VideoSlide {
  src: string;
  label?: string;
}

interface CinematicVideoChapterProps {
  id: string;
  dataSection: string;
  title: string;
  chapterLabel: string;
  slides: VideoSlide[];
  pinScrollPerSlide?: number;
  mobilePinScrollPerSlide?: number;
  lazyLoad?: boolean;
  fadeTitleOnScroll?: boolean;
}

function getPinPerSlide(
  desktop: number,
  mobile?: number
): number {
  if (typeof window === "undefined") return desktop;
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  return isMobile ? (mobile ?? Math.round(desktop * 0.58)) : desktop;
}

/**
 * Pinned scroll chapter — full-bleed videos crossfade on scroll.
 */
export default function CinematicVideoChapter({
  id,
  dataSection,
  title,
  chapterLabel,
  slides,
  pinScrollPerSlide = 750,
  mobilePinScrollPerSlide,
  lazyLoad = true,
  fadeTitleOnScroll = true,
}: CinematicVideoChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const chapterRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    if (!section) return;

    const pinPerSlide = getPinPerSlide(pinScrollPerSlide, mobilePinScrollPerSlide);
    const pinScroll = pinPerSlide * slides.length;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    if (lazyLoad) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            videoRefs.current.forEach((video, i) => {
              if (!video || video.src) return;
              const src = video.dataset.src;
              if (src) {
                video.src = src;
                if (i > 0) video.load();
              }
            });
            observer.disconnect();
          });
        },
        { rootMargin: "320px 0px" }
      );
      observer.observe(section);
    }

    const ctx = gsap.context(() => {
      slideRefs.current.forEach((slide, i) => {
        if (!slide) return;
        gsap.set(slide, { autoAlpha: i === 0 ? 1 : 0 });
      });
      labelRefs.current.forEach((label, i) => {
        if (!label) return;
        gsap.set(label, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 10 });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${pinScroll}`,
          pin: true,
          scrub: isMobile ? 0.45 : 0.65,
          anticipatePin: 1,
        },
      });

      tl.fromTo(
        chapterRef.current,
        { autoAlpha: 0, x: -12 },
        { autoAlpha: 1, x: 0, duration: 0.4, ease: "power2.out" },
        0
      );

      tl.fromTo(
        titleRef.current,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out" },
        0.05
      );

      if (fadeTitleOnScroll) {
        tl.to(titleRef.current, { autoAlpha: 0.18, duration: 0.35 }, 0.45);
      }

      const hold = isMobile ? 0.22 : 0.3;
      const fade = isMobile ? 0.18 : 0.22;

      for (let i = 0; i < slides.length - 1; i++) {
        const t = i + hold;

        tl.to(slideRefs.current[i], { autoAlpha: 0, duration: fade }, t);
        tl.to(slideRefs.current[i + 1], { autoAlpha: 1, duration: fade }, t);

        if (labelRefs.current[i]) {
          tl.to(labelRefs.current[i], { autoAlpha: 0, y: -6, duration: fade * 0.75 }, t);
        }
        if (labelRefs.current[i + 1]) {
          tl.fromTo(
            labelRefs.current[i + 1],
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: fade, ease: "power2.out" },
            t + fade * 0.2
          );
        }

        tl.call(
          () => {
            videoRefs.current[i]?.pause();
            const next = videoRefs.current[i + 1];
            if (next) {
              if (!next.src && next.dataset.src) next.src = next.dataset.src;
              next.play().catch(() => {});
            }
          },
          undefined,
          t
        );
      }

      tl.to({}, { duration: hold * 0.5 });
    }, sectionRef);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, [slides.length, pinScrollPerSlide, mobilePinScrollPerSlide, lazyLoad, fadeTitleOnScroll]);

  const hasLabels = slides.some((s) => s.label);

  return (
    <section
      id={id}
      data-pizza-section={dataSection}
      ref={sectionRef}
      style={{
        position: "relative",
        background: "#000",
        height: "100vh",
        overflow: "hidden",
        marginTop: -1,
      }}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          ref={(el) => {
            slideRefs.current[i] = el;
          }}
          style={{ position: "absolute", inset: 0, zIndex: 0 }}
        >
          <video
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            src={!lazyLoad || i === 0 ? slide.src : undefined}
            data-src={slide.src}
            autoPlay
            muted
            loop
            playsInline
            preload={!lazyLoad || i === 0 ? "auto" : "none"}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      ))}

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.45) 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

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
          {chapterLabel}
        </span>
      </div>

      <h2
        ref={titleRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          margin: 0,
          fontFamily: "var(--font-cinematic, serif)",
          fontSize: "clamp(1.8rem, 4.5vw, 4.5rem)",
          fontWeight: 300,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.9)",
          textShadow: "0 4px 48px rgba(0,0,0,0.75)",
          opacity: 0,
          zIndex: 5,
          pointerEvents: "none",
          textAlign: "center",
          padding: "0 1.5rem",
        }}
      >
        {title}
      </h2>

      {hasLabels && (
        <div
          style={{
            position: "absolute",
            bottom: "clamp(2rem, 5vw, 4rem)",
            left: "clamp(1.5rem, 5vw, 5rem)",
            zIndex: 6,
            minHeight: "1.5rem",
          }}
        >
          {slides.map((slide, i) =>
            slide.label ? (
              <p
                key={slide.label}
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                style={{
                  position: i === 0 ? "relative" : "absolute",
                  top: 0,
                  left: 0,
                  margin: 0,
                  fontFamily: "var(--font-cinematic, serif)",
                  fontSize: "clamp(0.55rem, 1vw, 0.72rem)",
                  letterSpacing: "0.38em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.74)",
                  opacity: i === 0 ? 1 : 0,
                }}
              >
                {slide.label}
              </p>
            ) : null
          )}
        </div>
      )}
    </section>
  );
}
