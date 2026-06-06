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
  /** Seconds (timeline units) to hold titles at full opacity before hiding */
  titleHold?: number;
  /** Hold per slide before crossfade */
  slideHold?: number;
  /** Crossfade duration between slides */
  slideFade?: number;
}

function getPinPerSlide(desktop: number, mobile?: number): number {
  if (typeof window === "undefined") return desktop;
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  return isMobile ? (mobile ?? Math.round(desktop * 0.58)) : desktop;
}

function primeVideo(video: HTMLVideoElement | null) {
  if (!video) return;
  const src = video.dataset.src;
  if (src && !video.src) video.src = src;
  video.load();
  video.play().catch(() => {});
}

/**
 * Pinned scroll chapter — full-bleed videos crossfade on scroll.
 * Chapter titles appear briefly, then fully disappear before slide transitions.
 */
export default function CinematicVideoChapter({
  id,
  dataSection,
  title,
  chapterLabel,
  slides,
  pinScrollPerSlide = 750,
  mobilePinScrollPerSlide,
  titleHold = 0.3,
  slideHold,
  slideFade,
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
    const pinScroll = pinPerSlide * Math.max(slides.length, 1);
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const hold = slideHold ?? (isMobile ? 0.16 : 0.2);
    const fade = slideFade ?? (isMobile ? 0.14 : 0.18);

    videoRefs.current.forEach((video) => primeVideo(video));

    const hideTitles = () => {
      gsap.set([chapterRef.current, titleRef.current], { autoAlpha: 0 });
    };

    const hideSlides = () => {
      slideRefs.current.forEach((slide) => {
        if (!slide) return;
        gsap.set(slide, { autoAlpha: 0, visibility: "hidden" });
      });
      videoRefs.current.forEach((video) => video?.pause());
    };

    const restoreSlides = () => {
      slideRefs.current.forEach((slide, i) => {
        if (!slide) return;
        gsap.set(slide, {
          autoAlpha: slides.length > 0 && i === 0 ? 1 : 0,
          visibility: "visible",
        });
      });
      if (slides.length > 0) {
        primeVideo(videoRefs.current[0]);
      }
    };

    const sealChapterExit = () => {
      hideTitles();
      hideSlides();
      gsap.set(section, {
        clearProps: "transform,top,left,width,maxWidth,maxHeight",
      });
    };

    const ctx = gsap.context(() => {
      slideRefs.current.forEach((slide, i) => {
        if (!slide) return;
        gsap.set(slide, { autoAlpha: i === 0 ? 1 : 0 });
      });
      labelRefs.current.forEach((label, i) => {
        if (!label) return;
        gsap.set(label, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 8 });
      });

      gsap.set([chapterRef.current, titleRef.current], { autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${pinScroll}`,
          pin: true,
          scrub: isMobile ? 0.4 : 0.55,
          anticipatePin: 1,
          onLeave: sealChapterExit,
          onLeaveBack: restoreSlides,
          onEnterBack: () => {
            hideTitles();
            restoreSlides();
          },
        },
      });

      if (slides.length > 0) {
        tl.call(() => primeVideo(videoRefs.current[0]), undefined, 0);
      }

      const titleIn = 0.06;
      tl.fromTo(
        chapterRef.current,
        { autoAlpha: 0, x: -8 },
        { autoAlpha: 1, x: 0, duration: 0.38, ease: "power2.out" },
        titleIn
      );
      tl.fromTo(
        titleRef.current,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.42, ease: "power2.out" },
        titleIn + 0.05
      );

      const titleOut = titleIn + 0.45 + titleHold;
      tl.to(
        [chapterRef.current, titleRef.current],
        { autoAlpha: 0, duration: 0.35, ease: "power2.in" },
        titleOut
      );

      const slidesStart = titleOut + 0.35;

      for (let i = 0; i < slides.length - 1; i++) {
        const t = slidesStart + i * (hold + fade);

        tl.to(slideRefs.current[i], { autoAlpha: 0, duration: fade }, t);
        tl.to(slideRefs.current[i + 1], { autoAlpha: 1, duration: fade }, t);

        if (labelRefs.current[i]) {
          tl.to(labelRefs.current[i], { autoAlpha: 0, y: -4, duration: fade * 0.7 }, t);
        }
        if (labelRefs.current[i + 1]) {
          tl.fromTo(
            labelRefs.current[i + 1],
            { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, duration: fade * 0.85, ease: "power2.out" },
            t + fade * 0.15
          );
        }

        tl.call(
          () => {
            videoRefs.current[i]?.pause();
            primeVideo(videoRefs.current[i + 1]);
          },
          undefined,
          t
        );
      }

      if (slides.length > 0) {
        const activeSlides = slideRefs.current.filter(
          (slide): slide is HTMLDivElement => slide !== null
        );
        tl.to(
          activeSlides,
          { autoAlpha: 0, duration: 0.3, ease: "power2.in" },
          ">-0.32"
        );
        tl.call(hideSlides, undefined, ">");
      }
    }, sectionRef);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, [
    slides.length,
    pinScrollPerSlide,
    mobilePinScrollPerSlide,
    titleHold,
    slideHold,
    slideFade,
  ]);

  const hasLabels = slides.some((s) => s.label);

  return (
    <section
      id={id}
      data-pizza-section={dataSection}
      ref={sectionRef}
      style={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        backgroundColor: "#000",
        isolation: "isolate",
      }}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          ref={(el) => {
            slideRefs.current[i] = el;
          }}
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        >
          <video
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            src={slide.src}
            data-src={slide.src}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
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
            "linear-gradient(to bottom, rgba(0,0,0,0.32) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.38) 100%)",
          pointerEvents: "none",
          zIndex: 4,
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
