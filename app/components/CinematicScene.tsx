"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TOTAL_FRAMES = 121;

function frameSrc(n: number): string {
  return `/frames/ezgif-frame-${String(n).padStart(3, "0")}.png`;
}

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
}

export default function CinematicScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesCanvasRef = useRef<HTMLCanvasElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLSpanElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const loadingBarRef = useRef<HTMLDivElement>(null);
  const loadingPctRef = useRef<HTMLSpanElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const section = sectionRef.current!;
    const particlesCanvas = particlesCanvasRef.current!;
    const pCtx = particlesCanvas.getContext("2d")!;

    const images: HTMLImageElement[] = [];
    let currentFrame = 0;
    let rafId = 0;

    function setupCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesCanvas.width = window.innerWidth;
      particlesCanvas.height = window.innerHeight;
    }

    function drawFrame(index: number) {
      const img = images[index];
      if (!img?.complete || !img.naturalWidth) return;

      // Mobile breakpoint — portrait phones and small tablets
      const isMobile = canvas.width < 768;

      // Progressive cinematic zoom — gentler on mobile so the pizza stays fully visible
      const progress = index / (TOTAL_FRAMES - 1);
      const scale = 1 + progress * (isMobile ? 0.025 : 0.07);

      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = canvas.width / canvas.height;

      let drawW: number, drawH: number;

      if (isMobile) {
        // Contain-style on mobile: fit the whole pizza within the viewport.
        // Landscape images fit by width; portrait/square images fit by height.
        // A 0.88 padding factor adds breathing room and keeps the look cinematic.
        const containPad = 0.88;
        if (imgAspect > canvasAspect) {
          drawW = canvas.width * containPad * scale;
          drawH = drawW / imgAspect;
        } else {
          drawH = canvas.height * containPad * scale;
          drawW = drawH * imgAspect;
        }
      } else {
        // Desktop: cover-style — image fills the full canvas with a subtle zoom-in
        if (imgAspect > canvasAspect) {
          drawH = canvas.height * scale;
          drawW = drawH * imgAspect;
        } else {
          drawW = canvas.width * scale;
          drawH = drawW / imgAspect;
        }
      }

      // Centre the image on both axes
      const drawX = (canvas.width - drawW) / 2;
      const drawY = (canvas.height - drawH) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // [PIZZA-SCROLL-HOOK] Future: emit the current frame index and progress
      // to the global pizza scroll context so downstream sections can react.
      // pizzaScrollEmit({ frame: index, progress });
    }

    // ---------- particles ----------
    const particles: Particle[] = Array.from({ length: 70 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -(Math.random() * 0.25 + 0.05),
      opacity: Math.random() * 0.22 + 0.04,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.015 + 0.005,
    }));

    function animateParticles() {
      pCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;
        const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));

        if (p.x < 0) p.x = particlesCanvas.width;
        if (p.x > particlesCanvas.width) p.x = 0;
        if (p.y < 0) p.y = particlesCanvas.height;

        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        pCtx.fillStyle = `rgba(255, 185, 60, ${alpha})`;
        pCtx.fill();
      });
      rafId = requestAnimationFrame(animateParticles);
    }

    // ---------- main init after preload ----------
    function initAnimations() {
      drawFrame(0);
      animateParticles();

      // Set initial hidden states
      gsap.set(
        [
          headlineRef.current,
          subtitleRef.current,
          lineRef.current,
          taglineRef.current,
        ],
        { autoAlpha: 0 }
      );
      gsap.set(headlineRef.current, { y: 70 });
      gsap.set(subtitleRef.current, { y: 40 });
      gsap.set(taglineRef.current, { y: 20 });
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: "left center" });

      const frameObj = { frame: 0 };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=5500",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      // Frame sequence — runs across the full timeline
      tl.to(
        frameObj,
        {
          frame: TOTAL_FRAMES - 1,
          ease: "none",
          duration: 10,
          onUpdate() {
            const idx = Math.min(
              Math.round(frameObj.frame),
              TOTAL_FRAMES - 1
            );
            if (idx !== currentFrame) {
              currentFrame = idx;
              drawFrame(currentFrame);
            }
          },
        },
        0
      );

      // Decorative line sweeps in
      tl.to(
        lineRef.current,
        { scaleX: 1, autoAlpha: 1, duration: 0.8, ease: "power2.out" },
        0.4
      );

      // Tagline
      tl.to(
        taglineRef.current,
        { autoAlpha: 0.55, y: 0, duration: 0.8, ease: "power2.out" },
        0.6
      );

      // Headline crashes in
      tl.to(
        headlineRef.current,
        { autoAlpha: 1, y: 0, duration: 1.4, ease: "power3.out" },
        0.7
      );

      // Subtitle fades up after headline
      tl.to(
        subtitleRef.current,
        { autoAlpha: 0.75, y: 0, duration: 1.2, ease: "power3.out" },
        1.1
      );

      // --- hold for a while, then everything exits ---
      tl.to(
        [
          headlineRef.current,
          subtitleRef.current,
          lineRef.current,
          taglineRef.current,
        ],
        {
          autoAlpha: 0,
          y: -40,
          duration: 0.9,
          ease: "power2.in",
          stagger: 0.06,
        },
        7.8
      );

      // [PIZZA-SCROLL-HOOK] Future: at this position in the timeline the hero
      // section hands the pizza off to the next storytelling section.
      // The ScrollTrigger `onLeave` callback below is the intended integration
      // point — connect it to the global pizza scroll context when ready.
      // tl.scrollTrigger.vars.onLeave = () => pizzaScrollContext.handOff("story");

      // Fade out the loading overlay
      gsap.to(loadingRef.current, {
        autoAlpha: 0,
        duration: 1.4,
        ease: "power2.inOut",
        delay: 0.2,
      });

      // Scroll hint fades in then breathes
      gsap.fromTo(
        scrollHintRef.current,
        { autoAlpha: 0, y: 10 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.2,
          ease: "power2.out",
          delay: 1.8,
          onComplete() {
            gsap.to(scrollHintRef.current, {
              y: 6,
              repeat: -1,
              yoyo: true,
              duration: 1.4,
              ease: "sine.inOut",
            });
          },
        }
      );
    }

    // ---------- preload ----------
    setupCanvas();
    let loaded = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = frameSrc(i);
      const onSettled = () => {
        loaded++;
        const pct = Math.round((loaded / TOTAL_FRAMES) * 100);
        if (loadingBarRef.current)
          loadingBarRef.current.style.width = `${pct}%`;
        if (loadingPctRef.current) loadingPctRef.current.textContent = `${pct}`;
        if (loaded === TOTAL_FRAMES) initAnimations();
      };
      img.onload = onSettled;
      img.onerror = onSettled;
      images.push(img);
    }

    const handleResize = () => {
      setupCanvas();
      drawFrame(currentFrame);
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      {/* ── Loading overlay ── */}
      <div
        ref={loadingRef}
        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
      >
        <div className="flex flex-col items-center gap-8 w-64">
          <span className="text-[10px] tracking-[0.5em] uppercase text-zinc-600 font-light">
            Loading Experience
          </span>

          <div className="relative w-full h-px bg-zinc-900 overflow-visible">
            <div
              ref={loadingBarRef}
              className="absolute inset-y-0 left-0 bg-amber-400"
              style={{
                width: "0%",
                transition: "width 80ms linear",
                boxShadow: "0 0 8px rgba(251,191,36,0.6)",
              }}
            />
          </div>

          <div className="flex items-baseline gap-1">
            <span
              ref={loadingPctRef}
              className="text-3xl font-light tabular-nums text-white"
              style={{ fontFamily: "var(--font-cinematic, serif)" }}
            >
              0
            </span>
            <span className="text-xs text-zinc-600">%</span>
          </div>
        </div>
      </div>

      {/* ── Cinematic section ── */}
      <section
        ref={sectionRef}
        data-pizza-section="hero"
        className="relative w-full bg-black overflow-hidden"
        style={{ height: "100vh" }}
      >
        {/* Image sequence canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 1 }}
        />

        {/* Particles */}
        <canvas
          ref={particlesCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 2 }}
        />

        {/* Radial vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 3,
            background:
              "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 35%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.88) 100%)",
          }}
        />

        {/* Cinematic letterbox bars */}
        <div
          className="absolute top-0 inset-x-0 pointer-events-none"
          style={{
            zIndex: 4,
            height: "clamp(28px, 5vw, 56px)",
            background: "linear-gradient(to bottom, #000 60%, transparent)",
          }}
        />
        <div
          className="absolute bottom-0 inset-x-0 pointer-events-none"
          style={{
            zIndex: 4,
            height: "clamp(28px, 5vw, 56px)",
            background: "linear-gradient(to top, #000 60%, transparent)",
          }}
        />

        {/* ── Typography overlay ── */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ zIndex: 5 }}
        >
          {/* Decorative label above headline */}
          <span
            ref={taglineRef}
            className="block mb-5 text-[9px] md:text-[10px] tracking-[0.55em] uppercase text-amber-400"
            style={{ fontFamily: "var(--font-cinematic, serif)", opacity: 0 }}
          >
            A Cinematic Experience
          </span>

          {/* Thin gold line */}
          <div
            ref={lineRef}
            className="mb-7"
            style={{
              width: "clamp(40px, 5vw, 72px)",
              height: "1px",
              background:
                "linear-gradient(to right, transparent, rgba(251,191,36,0.7), transparent)",
              opacity: 0,
            }}
          />

          {/* Main headline */}
          <h1
            ref={headlineRef}
            className="text-center leading-none tracking-wide text-white"
            style={{
              fontFamily: "var(--font-cinematic, serif)",
              fontSize: "clamp(2.8rem, 8vw, 7rem)",
              fontWeight: 300,
              letterSpacing: "0.06em",
              opacity: 0,
              textShadow: "0 4px 40px rgba(0,0,0,0.6)",
            }}
          >
            Crafted with Fire
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="mt-5 text-center font-light"
            style={{
              fontFamily: "var(--font-cinematic, serif)",
              fontSize: "clamp(0.65rem, 1.5vw, 0.95rem)",
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "rgba(253,230,138,0.8)",
              opacity: 0,
            }}
          >
            An immersive food experience
          </p>
        </div>

        {/* Scroll hint */}
        <div
          ref={scrollHintRef}
          className="absolute bottom-10 inset-x-0 flex flex-col items-center gap-3 pointer-events-none"
          style={{ zIndex: 5, opacity: 0 }}
        >
          <span
            className="text-[9px] tracking-[0.45em] uppercase"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Scroll
          </span>
          <div className="flex flex-col items-center gap-[3px]">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 1,
                  height: 5,
                  borderRadius: 1,
                  background: `rgba(251,191,36,${0.5 - i * 0.14})`,
                }}
              />
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
