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
  /** Last frame of previous chapter — crossfades into first slide when src differs.
   *  When equal to slides[0].src, declares continuity from the prior chapter's blendOutSrc
   *  and suppresses the overlap entry fade on slide 0. */
  blendInSrc?: string;
  /** First frame of next chapter — crossfades from last slide on exit */
  blendOutSrc?: string;
  /** Pull section up to overlap previous chapter's exit crossfade */
  overlapPrevVh?: number;
  /** Seconds (timeline units) to hold titles at full opacity before hiding */
  titleHold?: number;
  /** Hold per slide before crossfade */
  slideHold?: number;
  /** Crossfade duration between slides */
  slideFade?: number;
  /** Ingredient / slide label presentation */
  labelVariant?: "caption" | "title";
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
 * blendIn/blendOut keep continuity with adjacent chapters (no black gaps).
 */
export default function CinematicVideoChapter({
  id,
  dataSection,
  title,
  chapterLabel,
  slides,
  pinScrollPerSlide = 750,
  mobilePinScrollPerSlide,
  blendInSrc,
  blendOutSrc,
  overlapPrevVh = 0,
  titleHold = 0.3,
  slideHold,
  slideFade,
  labelVariant = "caption",
}: CinematicVideoChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const chapterRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const blendInRef = useRef<HTMLDivElement>(null);
  const blendOutRef = useRef<HTMLDivElement>(null);
  const blendInVideoRef = useRef<HTMLVideoElement>(null);
  const blendOutVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    if (!section) return;

    const pinPerSlide = getPinPerSlide(pinScrollPerSlide, mobilePinScrollPerSlide);
    const pinScroll = pinPerSlide * Math.max(slides.length, 1);
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const hold = slideHold ?? (isMobile ? 0.16 : 0.2);
    const overlapFade = slideFade ?? (isMobile ? 0.28 : 0.38);
    const labelLead = labelVariant === "title" ? 0.1 : overlapFade * 0.15;
    const labelLag = labelVariant === "title" ? 0.1 : overlapFade * 0.15;
    const primeLead = 0.06;
    const needsEntryBlend = blendInSrc && blendInSrc !== slides[0]?.src;
    /** Prior chapter blendOut hands off the same clip — keep slide 0 visible, no re-fade. */
    const continuousFromPrev = Boolean(blendInSrc && blendInSrc === slides[0]?.src);
    const hasOverlapEntry =
      overlapPrevVh > 0 && slides.length > 0 && !needsEntryBlend && !continuousFromPrev;
    const slide0Visible = !needsEntryBlend && !hasOverlapEntry;

    videoRefs.current.forEach((video) => primeVideo(video));
    primeVideo(blendInVideoRef.current);
    primeVideo(blendOutVideoRef.current);

    const earlyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          videoRefs.current.forEach((v) => primeVideo(v));
          earlyObserver.disconnect();
        });
      },
      { rootMargin: "320px 0px", threshold: 0 }
    );
    earlyObserver.observe(section);

    const hideChapter = () => {
      gsap.set([chapterRef.current, titleRef.current], { autoAlpha: 0 });
      gsap.set(labelRefs.current.filter(Boolean), { autoAlpha: 0 });
      slideRefs.current.forEach((slide) => {
        if (!slide) return;
        gsap.set(slide, { autoAlpha: 0 });
      });
      videoRefs.current.forEach((video) => video?.pause());
    };

    const restoreChapter = () => {
      gsap.set([chapterRef.current, titleRef.current], { autoAlpha: 0 });
      if (blendOutRef.current) gsap.set(blendOutRef.current, { autoAlpha: 0 });
      if (needsEntryBlend && blendInRef.current) {
        gsap.set(blendInRef.current, { autoAlpha: 1 });
      }
      slideRefs.current.forEach((slide, i) => {
        if (!slide) return;
        gsap.set(slide, {
          autoAlpha: slides.length > 0 && i === 0 && slide0Visible ? 1 : 0,
        });
      });
      if (slides.length > 0) {
        primeVideo(videoRefs.current[0]);
      }
    };

    const ctx = gsap.context(() => {
      slideRefs.current.forEach((slide, i) => {
        if (!slide) return;
        gsap.set(slide, {
          autoAlpha: i === 0 && slide0Visible ? 1 : 0,
        });
      });
      labelRefs.current.forEach((label, i) => {
        if (!label) return;
        const labelVisible = i === 0 && labelVariant !== "title";
        gsap.set(label, { autoAlpha: labelVisible ? 1 : 0, y: labelVisible ? 0 : 12 });
      });

      if (needsEntryBlend && blendInRef.current) {
        gsap.set(blendInRef.current, { autoAlpha: 1 });
      } else if (blendInRef.current) {
        gsap.set(blendInRef.current, { autoAlpha: 0 });
      }

      if (blendOutRef.current) {
        gsap.set(blendOutRef.current, { autoAlpha: 0 });
      }

      gsap.set([chapterRef.current, titleRef.current], { autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${pinScroll}`,
          pin: true,
          scrub: isMobile ? 0.4 : 0.55,
          anticipatePin: 1,
          onLeave: hideChapter,
          onEnterBack: restoreChapter,
        },
      });

      if (needsEntryBlend) {
        tl.to(blendInRef.current, { autoAlpha: 0, duration: 0.28 }, 0);
        tl.to(slideRefs.current[0], { autoAlpha: 1, duration: 0.28 }, 0);
        tl.call(() => primeVideo(videoRefs.current[0]), undefined, 0);
      } else if (hasOverlapEntry) {
        gsap.set(slideRefs.current[0], { autoAlpha: 0 });
        tl.to(slideRefs.current[0], { autoAlpha: 1, duration: 0.28, ease: "power2.out" }, 0);
        tl.call(() => primeVideo(videoRefs.current[0]), undefined, 0);
      } else if (slides.length > 0) {
        tl.call(() => primeVideo(videoRefs.current[0]), undefined, 0);
      }

      if (labelVariant === "title" && labelRefs.current[0]) {
        tl.fromTo(
          labelRefs.current[0],
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" },
          continuousFromPrev ? 0.12 : 0.2
        );
      }

      const titleIn = needsEntryBlend ? 0.18 : hasOverlapEntry ? 0.12 : 0.06;
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

      const entryOffset = needsEntryBlend ? 0.28 : 0;
      const slidesStart = titleOut + 0.35;

      for (let i = 0; i < slides.length - 1; i++) {
        const t = slidesStart + entryOffset + i * (hold + overlapFade);

        tl.call(() => primeVideo(videoRefs.current[i + 1]), undefined, t - primeLead);
        tl.to(
          slideRefs.current[i],
          { autoAlpha: 0, duration: overlapFade, ease: "power1.inOut" },
          t
        );
        tl.to(
          slideRefs.current[i + 1],
          { autoAlpha: 1, duration: overlapFade, ease: "power1.inOut" },
          t
        );
        tl.call(() => videoRefs.current[i]?.pause(), undefined, t + overlapFade);

        if (labelRefs.current[i]) {
          tl.to(
            labelRefs.current[i],
            {
              autoAlpha: 0,
              y: labelVariant === "title" ? -8 : -4,
              duration: labelVariant === "title" ? 0.18 : overlapFade * 0.7,
              ease: "power2.in",
            },
            t - labelLead
          );
        }
        if (labelRefs.current[i + 1]) {
          tl.fromTo(
            labelRefs.current[i + 1],
            { autoAlpha: 0, y: labelVariant === "title" ? 12 : 8 },
            {
              autoAlpha: 1,
              y: 0,
              duration: labelVariant === "title" ? 0.22 : overlapFade * 0.85,
              ease: "power2.out",
            },
            t + labelLag
          );
        }
      }

      if (blendOutSrc && blendOutRef.current && slides.length > 0) {
        const lastIdx = slides.length - 1;
        const exitStart =
          slidesStart +
          entryOffset +
          Math.max(0, slides.length - 1) * (hold + overlapFade) +
          hold * 0;

        if (labelRefs.current[lastIdx]) {
          tl.to(
            labelRefs.current[lastIdx],
            {
              autoAlpha: 0,
              y: labelVariant === "title" ? -8 : -4,
              duration: labelVariant === "title" ? 0.18 : overlapFade * 0.7,
              ease: "power2.in",
            },
            exitStart - 0.14
          );
        }
        tl.to(slideRefs.current[lastIdx], { autoAlpha: 0, duration: 0.32, ease: "none" }, exitStart);
        tl.fromTo(
          blendOutRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.32, ease: "none" },
          exitStart
        );
        tl.call(() => primeVideo(blendOutVideoRef.current), undefined, exitStart);
      } else if (slides.length > 0) {
        const lastIdx = slides.length - 1;
        /* Mirror the blendOutSrc exitStart formula so the label is fully in
           before the fade-out fires (">-0.25" was too early, overlapping the
           loop's label fade-in and being overridden by it). */
        const exitStart =
          slidesStart +
          entryOffset +
          Math.max(0, slides.length - 1) * (hold + overlapFade) +
          hold;

        /* Exclude incoming last slide — it is still crossfading in when exit starts. */
        const exitSlides =
          slides.length > 1
            ? slideRefs.current.filter(
                (slide, i): slide is HTMLDivElement => slide !== null && i < lastIdx
              )
            : slideRefs.current.filter(
                (slide): slide is HTMLDivElement => slide !== null
              );
        if (labelRefs.current[lastIdx]) {
          tl.to(
            labelRefs.current[lastIdx],
            {
              autoAlpha: 0,
              y: labelVariant === "title" ? -8 : -4,
              duration: labelVariant === "title" ? 0.18 : overlapFade * 0.7,
              ease: "power2.in",
            },
            exitStart - 0.14
          );
        }
        if (exitSlides.length > 0) {
          tl.to(
            exitSlides,
            { autoAlpha: 0, duration: 0.3, ease: "power2.in" },
            exitStart
          );
        }
        tl.call(hideChapter, undefined, ">");
      }
    }, sectionRef);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      earlyObserver.disconnect();
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, [
    slides.length,
    pinScrollPerSlide,
    mobilePinScrollPerSlide,
    blendInSrc,
    blendOutSrc,
    overlapPrevVh,
    titleHold,
    slideHold,
    slideFade,
    labelVariant,
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
        marginTop: overlapPrevVh ? `-${overlapPrevVh}vh` : 0,
      }}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          ref={(el) => {
            slideRefs.current[i] = el;
          }}
          style={{ position: "absolute", inset: 0, zIndex: i + 1 }}
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

      {blendInSrc && blendInSrc !== slides[0]?.src && (
        <div
          ref={blendInRef}
          style={{ position: "absolute", inset: 0, zIndex: 2, opacity: 0 }}
        >
          <video
            ref={blendInVideoRef}
            src={blendInSrc}
            data-src={blendInSrc}
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
      )}

      {blendOutSrc && (
        <div
          ref={blendOutRef}
          style={{ position: "absolute", inset: 0, zIndex: 3, opacity: 0 }}
        >
          <video
            ref={blendOutVideoRef}
            src={blendOutSrc}
            data-src={blendOutSrc}
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
      )}

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
            ...(labelVariant === "title"
              ? {
                  bottom: "clamp(16vh, 20vh, 24vh)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "min(92vw, 56rem)",
                  textAlign: "center",
                }
              : {
                  bottom: "clamp(2rem, 5vw, 4rem)",
                  left: "clamp(1.5rem, 5vw, 5rem)",
                }),
            zIndex: 6,
            minHeight: labelVariant === "title" ? "3rem" : "1.5rem",
            pointerEvents: "none",
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
                  left: labelVariant === "title" ? "50%" : 0,
                  transform: labelVariant === "title" ? "translateX(-50%)" : undefined,
                  width: labelVariant === "title" ? "100%" : undefined,
                  margin: 0,
                  fontFamily: "var(--font-cinematic, serif)",
                  fontSize:
                    labelVariant === "title"
                      ? "clamp(2rem, 4vw, 3.5rem)"
                      : "clamp(0.55rem, 1vw, 0.72rem)",
                  fontWeight: labelVariant === "title" ? 300 : undefined,
                  letterSpacing: labelVariant === "title" ? "0.08em" : "0.38em",
                  textTransform: labelVariant === "title" ? "none" : "uppercase",
                  color:
                    labelVariant === "title"
                      ? "rgba(255,255,255,0.88)"
                      : "rgba(255,255,255,0.74)",
                  textShadow:
                    labelVariant === "title" ? "0 4px 40px rgba(0,0,0,0.65)" : undefined,
                  opacity: i === 0 && labelVariant !== "title" ? 1 : 0,
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
