"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface StageSlide {
  src: string;
  label?: string;
}

export interface StageChapter {
  /** DOM id used for #hash navigation (an invisible anchor is placed at the chapter start). */
  id: string;
  title: string;
  kicker: string;
  slides: StageSlide[];
}

/** `/videos/oven.mp4` -> `/posters/oven` (stills made by scripts/make-posters.mjs) */
function posterBase(src: string): string {
  return `/posters/${src.split("/").pop()!.replace(/\.mp4$/, "")}`;
}

/**
 * Landscape (desktop): the clip fills the stage (cover), exactly as before.
 * Portrait (phones): cover would keep only the middle ~30% of a 16:9 frame, so the
 * clip is shown whole (contain, a 16:9 band in the middle) over a blurred ambient
 * fill made from its poster, with soft top/bottom edges.
 */
const STAGE_CSS = `
.stage-video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; background:#000; }
.stage-backdrop { display:none; }
@media (orientation: portrait) {
  .stage-backdrop {
    display:block; position:absolute; inset:-6%;
    background-size:cover; background-position:center; background-color:#050505;
  }
  .stage-video {
    inset:auto; left:0; right:0; top:46%;
    width:100%; height:auto; aspect-ratio:16/9;
    transform:translateY(-50%);
    object-fit:contain; background:transparent;
    -webkit-mask-image:linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%);
    mask-image:linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%);
  }
}
`;

/**
 * One pinned "stage" for ALL narrative chapters.
 *
 * Why: separate pins per chapter produced seams (the same clip at two different
 * playhead times) and unpin/jump artefacts. Here a single pin + one master
 * timeline owns every video layer, so nothing ever scrolls away between
 * chapters — transitions are pure crossfades that we fully control.
 *
 * Transition language ("fire light"):
 *   - incoming clip fades in with ease power2.inOut while settling from a 1.10
 *     push-in to 1.0; outgoing clip drifts to 1.05 as it leaves
 *   - a warm amber bloom peaks at the middle of every crossfade
 *   - titles tracking-in + blur-to-sharp; labels rise out of blur
 *   - title and label of a chapter are never visible at the same time
 */
export default function CinematicStage({ chapters }: { chapters: StageChapter[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const slideEls = useRef<(HTMLDivElement | null)[]>([]);
  const zoomEls = useRef<(HTMLDivElement | null)[]>([]);
  const videoEls = useRef<(HTMLVideoElement | null)[]>([]);
  const labelEls = useRef<(HTMLParagraphElement | null)[]>([]);
  const kickerEls = useRef<(HTMLDivElement | null)[]>([]);
  const titleEls = useRef<(HTMLHeadingElement | null)[]>([]);
  const anchorEls = useRef<(HTMLDivElement | null)[]>([]);

  const flat = chapters.flatMap((c, ci) => c.slides.map((s, si) => ({ ...s, ci, si })));

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const wrap = wrapRef.current;
    const section = sectionRef.current;
    if (!wrap || !section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    /** Scroll pixels per timeline unit. */
    const PX = isMobile ? 110 : 150;

    const FADE = 0.8;
    const TITLE_IN = 0.8;
    const TITLE_HOLD = 0.35;
    const TITLE_OUT = 0.45;
    const LABEL_IN = 0.6;
    const LABEL_DWELL = 0.8;
    const LABEL_OUT = 0.35;
    const BARE_HOLD = 0.9; // slide without a label: breathe after the title
    /** Dissolve from the hero into the oven (the stage is pinned while the hero is
     *  still pinned underneath, so the pizza melts into the fire — no vertical slide). */
    const OPEN = 1.25;

    const PUSH_IN = reduced ? 1 : 1.1;
    const DRIFT_OUT = reduced ? 1 : 1.05;
    const BLUR = reduced ? "blur(0px)" : "blur(12px)";
    const RISE = reduced ? 0 : 18;
    const BLOOM_PEAK = reduced ? 0 : 0.34;
    const TRACK_FROM = reduced ? "0.14em" : "0.3em";

    const slides = slideEls.current.filter(Boolean) as HTMLDivElement[];
    const zooms = zoomEls.current.filter(Boolean) as HTMLDivElement[];
    const videos = videoEls.current.filter(Boolean) as HTMLVideoElement[];
    const bloom = bloomRef.current!;

    const ctx = gsap.context(() => {
      /* ---------- initial state ---------- */
      /* the stage stays invisible until its pin starts, then the oven dissolves in */
      gsap.set(section, { autoAlpha: 0 });
      slides.forEach((el) => gsap.set(el, { autoAlpha: 0 }));
      zooms.forEach((el) => gsap.set(el, { scale: 1 }));
      gsap.set(bloom, { autoAlpha: 0 });
      gsap.set(dimRef.current, { autoAlpha: 0 });
      kickerEls.current.forEach((el) => el && gsap.set(el, { autoAlpha: 0, y: 8 }));
      titleEls.current.forEach(
        (el) =>
          el &&
          gsap.set(el, {
            autoAlpha: 0,
            xPercent: -50,
            yPercent: -50,
            y: RISE,
            filter: BLUR,
            letterSpacing: TRACK_FROM,
          })
      );
      labelEls.current.forEach(
        (el) => el && gsap.set(el, { autoAlpha: 0, xPercent: -50, y: RISE, filter: BLUR })
      );

      /* ---------- master timeline ---------- */
      const tl = gsap.timeline({ paused: true });
      const chapterStart: number[] = [];
      let fadeStart = 0; // when slide g begins fading in (g = 0: already visible)

      flat.forEach((s, g) => {
        const isFirst = s.si === 0;
        const isLast = g === flat.length - 1;
        const full = g === 0 ? OPEN : fadeStart + FADE; // slide g fully visible
        /* #hash anchors land when the chapter's first clip is fully in */
        if (isFirst) chapterStart[s.ci] = full;

        let contentEnd = full; // time when this slide's overlays are done

        /* opening dissolve: hero pizza -> oven. Eased, with a push-in, a little blur
           clearing and a warm bloom, instead of two blocks sliding past each other. */
        if (g === 0) {
          tl.to(section, { autoAlpha: 1, duration: 0.001, ease: "none" }, 0);
          tl.to(slides[0], { autoAlpha: 1, duration: OPEN, ease: "power2.inOut" }, 0);
          if (!reduced) {
            tl.fromTo(
              zooms[0],
              { scale: 1.18, filter: "blur(14px)" },
              { scale: 1, filter: "blur(0px)", duration: OPEN + 1.6, ease: "power3.out" },
              0
            );
            tl.to(bloom, { autoAlpha: 0.5, duration: OPEN * 0.45, ease: "power1.out" }, 0);
            tl.to(bloom, { autoAlpha: 0, duration: OPEN * 0.55, ease: "power1.in" }, OPEN * 0.45);
          }
        }

        /* chapter title (first slide of every chapter) */
        if (isFirst) {
          const kicker = kickerEls.current[s.ci];
          const title = titleEls.current[s.ci];
          const tIn = full + (g === 0 ? 0.3 : 0.05);
          if (kicker) {
            tl.to(kicker, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, tIn);
            tl.to(kicker, { autoAlpha: 0, duration: 0.4, ease: "power2.in" }, tIn + TITLE_IN + TITLE_HOLD);
          }
          if (title) {
            tl.to(
              title,
              {
                autoAlpha: 1,
                y: 0,
                filter: "blur(0px)",
                letterSpacing: "0.14em",
                duration: TITLE_IN,
                ease: "power3.out",
              },
              tIn
            );
            tl.to(
              title,
              {
                autoAlpha: 0,
                y: -RISE * 0.6,
                filter: BLUR,
                duration: TITLE_OUT,
                ease: "power2.in",
              },
              tIn + TITLE_IN + TITLE_HOLD
            );
          }
          contentEnd = tIn + TITLE_IN + TITLE_HOLD + TITLE_OUT;
        }

        /* slide label — only after the chapter title is gone */
        const label = labelEls.current[g];
        if (label) {
          const lIn = isFirst ? contentEnd - 0.1 : full + 0.15;
          tl.to(label, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: LABEL_IN, ease: "power2.out" }, lIn);
          const lOut = lIn + LABEL_IN + LABEL_DWELL;
          tl.to(
            label,
            { autoAlpha: 0, y: -RISE * 0.5, filter: BLUR, duration: LABEL_OUT, ease: "power2.in" },
            lOut
          );
          contentEnd = lOut + LABEL_OUT;
        } else if (isFirst) {
          contentEnd += BARE_HOLD;
        }

        /* hand-off to the next slide, or final exit */
        const nf = contentEnd + 0.1;
        if (!isLast) {
          const next = g + 1;
          tl.to(slides[g], { autoAlpha: 0, duration: FADE, ease: "power2.inOut" }, nf);
          tl.to(slides[next], { autoAlpha: 1, duration: FADE, ease: "power2.inOut" }, nf);
          tl.to(zooms[g], { scale: DRIFT_OUT, duration: FADE, ease: "power1.in" }, nf);
          tl.fromTo(
            zooms[next],
            { scale: PUSH_IN },
            { scale: 1, duration: FADE + 1.6, ease: "power2.out", immediateRender: false },
            nf
          );
          if (zooms[next]) gsap.set(zooms[next], { scale: PUSH_IN });
          tl.to(bloom, { autoAlpha: BLOOM_PEAK, duration: FADE * 0.5, ease: "power1.out" }, nf);
          tl.to(bloom, { autoAlpha: 0, duration: FADE * 0.5, ease: "power1.in" }, nf + FADE * 0.5);
          fadeStart = nf;
        } else {
          /* Curtain hand-off: the Signature section rises over this pinned stage
             (it has margin-top: -100vh and a soft gradient top edge). Meanwhile the
             last clip pushes in slowly and dims. No fade-to-black cut. The timeline
             ends exactly when the curtain has covered the viewport. */
          const pad = window.innerHeight / PX;
          tl.to(zooms[g], { scale: reduced ? 1 : 1.08, duration: pad, ease: "none" }, nf);
          tl.to(dimRef.current, { autoAlpha: 0.78, duration: pad, ease: "power1.in" }, nf);
        }
      });

      /* ---------- one pin for the whole stage ---------- */
      const placeAnchors = () => {
        chapters.forEach((_, ci) => {
          const a = anchorEls.current[ci];
          if (a) a.style.top = `${Math.round(chapterStart[ci] * PX)}px`;
        });
      };
      placeAnchors();

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${Math.round(tl.duration() * PX)}`,
        pin: true,
        scrub: isMobile ? 0.4 : 0.45,
        anticipatePin: 1,
        animation: tl,
        invalidateOnRefresh: true,
        onRefresh: placeAnchors,
      });

      /* ---------- fetch the later clips once the visitor starts scrolling ---------- */
      ScrollTrigger.create({
        start: 250,
        once: true,
        onEnter: () => videos.forEach((v) => (v.preload = "auto")),
      });

      /* ---------- play only what is visible ---------- */
      const sync = () => {
        slides.forEach((el, i) => {
          const v = videos[i];
          if (!v) return;
          const visible = (gsap.getProperty(el, "opacity") as number) > 0.01;
          if (visible && v.paused) v.play().catch(() => {});
          else if (!visible && !v.paused) v.pause();
        });
      };
      tl.eventCallback("onUpdate", sync);
      ScrollTrigger.create({
        trigger: wrap,
        start: "top bottom+=300",
        end: "bottom top-=300",
        onToggle: (self) => (self.isActive ? sync() : videos.forEach((v) => v.pause())),
      });
    }, wrap);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize, { passive: true });

    /* Phones in low-power / data-saver mode refuse play() until the visitor touches
       the page. Retry on every touch so the clips start as soon as they are allowed
       (until then the poster stills are shown). */
    const retryPlay = () =>
      videoEls.current.forEach((v, i) => {
        const el = slideEls.current[i];
        if (!v || !el) return;
        if ((gsap.getProperty(el, "opacity") as number) > 0.01 && v.paused) v.play().catch(() => {});
      });
    window.addEventListener("touchstart", retryPlay, { passive: true });
    window.addEventListener("touchend", retryPlay, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("touchstart", retryPlay);
      window.removeEventListener("touchend", retryPlay);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        zIndex: 3,
        /* Start the stage's pin ~180px BEFORE the hero's pin ends, on top of it, so the
           oven dissolves in over the still-pinned hero (see OPEN in the timeline). */
        marginTop: "calc(-1 * var(--vh100) - 180px)",
      }}
    >
      <style>{STAGE_CSS}</style>
      <section
        ref={sectionRef}
        data-pizza-section="story"
        style={{
          position: "relative",
          height: "var(--vh100)",
          overflow: "hidden",
          margin: 0,
          padding: 0,
          backgroundColor: "transparent",
          isolation: "isolate",
        }}
      >
        <div ref={layersRef} style={{ position: "absolute", inset: 0, willChange: "transform" }}>
          {flat.map((s, g) => (
            <div
              key={s.src}
              ref={(el) => {
                slideEls.current[g] = el;
              }}
              style={{ position: "absolute", inset: 0, zIndex: g + 1 }}
            >
              <div
                ref={(el) => {
                  zoomEls.current[g] = el;
                }}
                style={{ position: "absolute", inset: 0, willChange: "transform" }}
              >
                {/* portrait phones: soft blurred ambient fill behind the full 16:9 frame */}
                <div
                  className="stage-backdrop"
                  aria-hidden="true"
                  style={{ backgroundImage: `url(${posterBase(s.src)}-bg.webp)` }}
                />
                <video
                  ref={(el) => {
                    videoEls.current[g] = el;
                  }}
                  className="stage-video"
                  src={s.src}
                  poster={`${posterBase(s.src)}.webp`}
                  muted
                  loop
                  playsInline
                  preload={g < 2 ? "auto" : "metadata"}
                  autoPlay={g === 0}
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
        </div>

        {/* static vignette: nav legibility + cinematic edges */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            pointerEvents: "none",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, transparent 20%, transparent 78%, rgba(0,0,0,0.48) 100%)",
          }}
        />

        {/* amber bloom: peaks mid-crossfade */}
        <div
          ref={bloomRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 21,
            pointerEvents: "none",
            opacity: 0,
            mixBlendMode: "screen",
            background:
              "radial-gradient(ellipse 75% 65% at 50% 58%, rgba(251,146,60,0.65) 0%, rgba(190,70,12,0.32) 45%, transparent 78%)",
          }}
        />

        {/* dims the last clip while the Signature section rises over the stage */}
        <div
          ref={dimRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 22,
            pointerEvents: "none",
            opacity: 0,
            background: "radial-gradient(ellipse 90% 80% at 50% 45%, rgba(8,8,8,0.55), #080808 90%)",
          }}
        />

        {chapters.map((c, ci) => (
          <div
            key={`kicker-${c.id}`}
            ref={(el) => {
              kickerEls.current[ci] = el;
            }}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "clamp(4.2rem, 7vw, 6rem)",
              left: "clamp(1.5rem, 5vw, 5rem)",
              zIndex: 30,
              opacity: 0,
              fontFamily: "var(--font-cinematic, serif)",
              fontSize: "0.52rem",
              letterSpacing: "0.52em",
              textTransform: "uppercase",
              color: "rgba(251,191,36,0.5)",
            }}
          >
            {c.kicker}
          </div>
        ))}

        {chapters.map((c, ci) => (
          <h2
            key={`title-${c.id}`}
            ref={(el) => {
              titleEls.current[ci] = el;
            }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              margin: 0,
              zIndex: 30,
              width: "100%",
              padding: "0 1.5rem",
              textAlign: "center",
              pointerEvents: "none",
              opacity: 0,
              fontFamily: "var(--font-cinematic, serif)",
              fontSize: "clamp(1.8rem, 4.5vw, 4.5rem)",
              fontWeight: 300,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.92)",
              textShadow: "0 4px 48px rgba(0,0,0,0.75)",
            }}
          >
            {c.title}
          </h2>
        ))}

        {flat.map((s, g) =>
          s.label ? (
            <p
              key={`label-${s.src}`}
              ref={(el) => {
                labelEls.current[g] = el;
              }}
              style={{
                position: "absolute",
                left: "50%",
                bottom: "clamp(16vh, 20vh, 24vh)",
                margin: 0,
                zIndex: 30,
                width: "min(92vw, 56rem)",
                textAlign: "center",
                pointerEvents: "none",
                opacity: 0,
                fontFamily: "var(--font-cinematic, serif)",
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                fontWeight: 300,
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.9)",
                textShadow: "0 4px 40px rgba(0,0,0,0.65)",
              }}
            >
              {s.label}
            </p>
          ) : null
        )}
      </section>

      {/* invisible #hash anchors, positioned at each chapter start */}
      {chapters.map((c, ci) => (
        <div
          key={`anchor-${c.id}`}
          id={c.id}
          ref={(el) => {
            anchorEls.current[ci] = el;
          }}
          aria-hidden="true"
          style={{ position: "absolute", left: 0, width: 1, height: 1, top: 0, pointerEvents: "none" }}
        />
      ))}
    </div>
  );
}
