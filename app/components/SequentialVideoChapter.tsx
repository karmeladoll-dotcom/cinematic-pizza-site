"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface VideoSlide {
  src: string;
  weight?: number;
}

interface SequentialVideoChapterProps {
  id: string;
  dataSection: string;
  title: string;
  chapterLabel: string;
  slides: VideoSlide[];
  blendInSrc?: string;
  blendOutSrc?: string;
  /** Pull section up to overlap previous chapter's exit crossfade */
  overlapPrevVh?: number;
}

function primeVideo(video: HTMLVideoElement | null) {
  if (!video) return;
  const src = video.dataset.src;
  if (src && !video.src) video.src = src;
  video.load();
  video.play().catch(() => {});
}

/**
 * Stacked video chapter — clips play in sequence with scroll-driven handoffs.
 */
export default function SequentialVideoChapter({
  id,
  dataSection,
  title,
  chapterLabel,
  slides,
  blendInSrc,
  blendOutSrc,
  overlapPrevVh = 0,
}: SequentialVideoChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const slideWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chapterRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const blendInRef = useRef<HTMLDivElement>(null);
  const blendOutRef = useRef<HTMLDivElement>(null);
  const blendInVideoRef = useRef<HTMLVideoElement>(null);
  const blendOutVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    if (!section) return;

    const needsEntryBlend = blendInSrc && blendInSrc !== slides[0]?.src;

    /* Preload all clips early */
    videoRefs.current.forEach((v) => primeVideo(v));
    primeVideo(blendInVideoRef.current);
    primeVideo(blendOutVideoRef.current);

    if (needsEntryBlend && blendInRef.current && slideWrapRefs.current[0]) {
      gsap.set(blendInRef.current, { autoAlpha: 1 });
      gsap.set(slideWrapRefs.current[0], { autoAlpha: 0 });
      gsap.to(blendInRef.current, { autoAlpha: 0, duration: 0.7, ease: "power1.inOut" });
      gsap.to(slideWrapRefs.current[0], { autoAlpha: 1, duration: 0.7, ease: "power1.inOut" });
    }

    /* Titles appear over footage, not on black */
    gsap.set([chapterRef.current, titleRef.current], { autoAlpha: 0 });
    gsap.to(chapterRef.current, {
      autoAlpha: 1,
      duration: 0.55,
      delay: needsEntryBlend ? 0.35 : 0.15,
      ease: "power2.out",
    });
    gsap.to(titleRef.current, {
      autoAlpha: 1,
      duration: 0.6,
      delay: needsEntryBlend ? 0.45 : 0.22,
      ease: "power2.out",
    });
    gsap.to(titleRef.current, {
      autoAlpha: 0.14,
      duration: 0.5,
      delay: needsEntryBlend ? 1.4 : 1.0,
      ease: "power1.inOut",
    });

    /* Start first clip before it enters viewport */
    const earlyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          primeVideo(videoRefs.current[0]);
          primeVideo(blendInVideoRef.current);
          earlyObserver.disconnect();
        });
      },
      { rootMargin: "280px 0px", threshold: 0 }
    );
    earlyObserver.observe(section);

    /* Later slides */
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            primeVideo(video);
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.15, rootMargin: "200px 0px" }
    );

    videoRefs.current.forEach((video, i) => {
      if (video && i > 0) observer.observe(video);
    });

    /* Exit crossfade into next chapter */
    let exitTrigger: ScrollTrigger | undefined;
    if (blendOutSrc && blendOutRef.current && slideWrapRefs.current.length) {
      const lastWrap = slideWrapRefs.current[slideWrapRefs.current.length - 1];
      gsap.set(blendOutRef.current, { autoAlpha: 0 });

      exitTrigger = ScrollTrigger.create({
        trigger: section,
        start: "bottom 90%",
        end: "bottom 35%",
        scrub: 0.4,
        onUpdate(self) {
          const p = self.progress;
          if (lastWrap) gsap.set(lastWrap, { autoAlpha: 1 - p });
          gsap.set(blendOutRef.current, { autoAlpha: p });
          if (p > 0.05) primeVideo(blendOutVideoRef.current);
        },
      });
    }

    return () => {
      earlyObserver.disconnect();
      observer.disconnect();
      exitTrigger?.kill();
    };
  }, [slides.length, blendInSrc, blendOutSrc]);

  return (
    <section
      id={id}
      data-pizza-section={dataSection}
      ref={sectionRef}
      className="narrative-sequential"
      style={{
        position: "relative",
        margin: 0,
        padding: 0,
        marginTop: overlapPrevVh ? `-${overlapPrevVh}vh` : 0,
      }}
    >
      <style>{`
        .narrative-sequential .seq-slide {
          height: 100vh;
        }
        @media (max-width: 767px) {
          .narrative-sequential .seq-slide {
            height: clamp(68vh, 78vh, 88vh);
          }
          .narrative-sequential .seq-slide--featured {
            height: clamp(74vh, 82vh, 92vh);
          }
        }
      `}</style>

      {blendInSrc && blendInSrc !== slides[0]?.src && (
        <div
          ref={blendInRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            height: "100vh",
            pointerEvents: "none",
          }}
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

      {slides.map((slide, i) => {
        const isFeatured = (slide.weight ?? 1) > 1 || slides.length === 1;
        return (
          <div
            key={slide.src}
            ref={(el) => {
              slideWrapRefs.current[i] = el;
            }}
            className={`seq-slide${isFeatured ? " seq-slide--featured" : ""}`}
            style={{
              position: "relative",
              overflow: "hidden",
              ...(i === 0 && overlapPrevVh
                ? { height: `calc(100vh + ${overlapPrevVh}vh)` }
                : {}),
            }}
          >
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              src={slide.src}
              data-src={slide.src}
              autoPlay={i === 0}
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

            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.32) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.36) 100%)",
                pointerEvents: "none",
              }}
            />

            {i === 0 && (
              <>
                <div
                  ref={chapterRef}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: "clamp(1.5rem, 3vw, 2.5rem)",
                    left: "clamp(1.5rem, 5vw, 5rem)",
                    zIndex: 5,
                    opacity: 0,
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
                    fontSize: "clamp(1.6rem, 4vw, 3.8rem)",
                    fontWeight: 300,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.82)",
                    textShadow: "0 4px 40px rgba(0,0,0,0.7)",
                    zIndex: 4,
                    pointerEvents: "none",
                    textAlign: "center",
                    padding: "0 1.5rem",
                    opacity: 0,
                  }}
                >
                  {title}
                </h2>
              </>
            )}
          </div>
        );
      })}

      {blendOutSrc && (
        <div
          ref={blendOutRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            opacity: 0,
            pointerEvents: "none",
          }}
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
    </section>
  );
}
