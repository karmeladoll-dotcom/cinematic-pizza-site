"use client";

import { useEffect, useRef } from "react";

export interface VideoSlide {
  src: string;
  /** Extra viewport share for standout shots (default 1) */
  weight?: number;
}

interface SequentialVideoChapterProps {
  id: string;
  dataSection: string;
  title: string;
  chapterLabel: string;
  slides: VideoSlide[];
}

/**
 * Stacked video chapter — one clip per scroll step, no pin/scrub effects.
 */
export default function SequentialVideoChapter({
  id,
  dataSection,
  title,
  chapterLabel,
  slides,
}: SequentialVideoChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    /* Eager-load first clip so the chapter opens without a black frame */
    const first = videoRefs.current[0];
    if (first?.dataset.src && !first.src) {
      first.src = first.dataset.src;
      first.load();
      first.play().catch(() => {});
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            if (!video.src && video.dataset.src) {
              video.src = video.dataset.src;
              video.load();
            }
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.2, rootMargin: "120px 0px" }
    );

    videoRefs.current.forEach((video, i) => {
      if (video && i > 0) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [slides.length]);

  return (
    <section
      id={id}
      data-pizza-section={dataSection}
      ref={sectionRef}
      className="narrative-sequential"
      style={{ position: "relative", background: "#000", marginTop: -1 }}
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

      {slides.map((slide, i) => {
        const isFeatured = (slide.weight ?? 1) > 1 || slides.length === 1;
        return (
          <div
            key={slide.src}
            className={`seq-slide${isFeatured ? " seq-slide--featured" : ""}`}
            style={{
              position: "relative",
              overflow: "hidden",
              background: "#000",
            }}
          >
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              src={i === 0 ? slide.src : undefined}
              data-src={slide.src}
              autoPlay={i === 0}
              muted
              loop
              playsInline
              preload={i === 0 ? "auto" : "none"}
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
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: "clamp(1.5rem, 3vw, 2.5rem)",
                    left: "clamp(1.5rem, 5vw, 5rem)",
                    zIndex: 5,
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
                  }}
                >
                  {title}
                </h2>
              </>
            )}
          </div>
        );
      })}
    </section>
  );
}
