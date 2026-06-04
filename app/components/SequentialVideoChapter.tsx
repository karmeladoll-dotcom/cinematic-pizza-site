"use client";

import { useEffect, useRef } from "react";

export interface VideoSlide {
  src: string;
}

interface SequentialVideoChapterProps {
  id: string;
  dataSection: string;
  title: string;
  chapterLabel: string;
  slides: VideoSlide[];
}

/**
 * Simple stacked video chapter — one full-viewport clip per scroll step.
 * No pin/scrub effects; supports the narrative without competing with hero.
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
      { threshold: 0.35, rootMargin: "80px 0px" }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [slides.length]);

  return (
    <section
      id={id}
      data-pizza-section={dataSection}
      ref={sectionRef}
      style={{ position: "relative", background: "#000" }}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          style={{
            position: "relative",
            height: "100vh",
            overflow: "hidden",
            background: "#000",
          }}
        >
          <video
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            data-src={slide.src}
            muted
            loop
            playsInline
            preload="none"
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
                "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 22%, transparent 78%, rgba(0,0,0,0.4) 100%)",
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
      ))}
    </section>
  );
}
