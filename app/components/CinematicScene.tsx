"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Hero plays frames 001–025 only (ezgif-frame-001.png … ezgif-frame-025.png). */
const ROTATION_END_FRAME = 24;
const HERO_FRAME_COUNT = ROTATION_END_FRAME + 1;

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
  const heroVisualsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesCanvasRef = useRef<HTMLCanvasElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
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
    let heroDismissed = false;

    function setupCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesCanvas.width = window.innerWidth;
      particlesCanvas.height = window.innerHeight;
    }

    function dismissHero() {
      if (heroDismissed) return;
      heroDismissed = true;
      currentFrame = ROTATION_END_FRAME;

      cancelAnimationFrame(rafId);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

      gsap.set([canvas, particlesCanvas, heroVisualsRef.current], {
        autoAlpha: 0,
        visibility: "hidden",
        display: "none",
      });

      gsap.set(section, {
        height: 0,
        minHeight: 0,
        margin: 0,
        padding: 0,
        overflow: "hidden",
        pointerEvents: "none",
      });

      ScrollTrigger.refresh();
    }

    function restoreHeroIfAtTop() {
      if (!heroDismissed || window.scrollY > 80) return;

      heroDismissed = false;

      gsap.set(section, {
        height: "100vh",
        minHeight: "",
        margin: "",
        padding: "",
        overflow: "hidden",
        pointerEvents: "",
      });

      gsap.set([canvas, particlesCanvas, heroVisualsRef.current], {
        display: "block",
        visibility: "visible",
      });

      animateParticles();
      drawFrame(currentFrame);
    }

    function drawFrame(index: number) {
      if (heroDismissed) return;

      const idx = Math.min(Math.max(0, index), ROTATION_END_FRAME);
      const img = images[idx];
      if (!img?.complete || !img.naturalWidth) return;

      const isMobile = canvas.width < 768;
      const progress = ROTATION_END_FRAME > 0 ? idx / ROTATION_END_FRAME : 0;
      const scale = 1 + progress * (isMobile ? 0.02 : 0.05);

      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = canvas.width / canvas.height;

      let drawW: number, drawH: number;

      if (isMobile) {
        const containPad = 0.88;
        if (imgAspect > canvasAspect) {
          drawW = canvas.width * containPad * scale;
          drawH = drawW / imgAspect;
        } else {
          drawH = canvas.height * containPad * scale;
          drawW = drawH * imgAspect;
        }
      } else {
        if (imgAspect > canvasAspect) {
          drawH = canvas.height * scale;
          drawW = drawH * imgAspect;
        } else {
          drawW = canvas.width * scale;
          drawH = drawW / imgAspect;
        }
      }

      const drawX = (canvas.width - drawW) / 2;
      const drawY = (canvas.height - drawH) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }

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
      if (heroDismissed) return;

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

    function initAnimations() {
      drawFrame(0);
      animateParticles();

      gsap.set([headlineRef.current, lineRef.current], { autoAlpha: 0 });
      gsap.set(headlineRef.current, { y: 50 });
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: "center center" });

      const frameObj = { frame: 0 };
      /* Rotation plays first, then holds on final frame — no ingredient tail */
      const FRAME_PLAY = 2.6;
      const TITLE_IN_AT = 2.0;
      const TITLE_HOLD = 0.45;
      const FADE_OUT = 0.7;
      const PIN_SCROLL = 2200;

      function lockRotationFrame() {
        if (heroDismissed) return;
        if (currentFrame !== ROTATION_END_FRAME) {
          currentFrame = ROTATION_END_FRAME;
          drawFrame(currentFrame);
        }
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${PIN_SCROLL}`,
          pin: true,
          scrub: 0.55,
          anticipatePin: 1,
          onLeave: () => {
            dismissHero();
          },
          onEnterBack: () => {
            restoreHeroIfAtTop();
          },
        },
      });

      tl.to(
        frameObj,
        {
          frame: ROTATION_END_FRAME,
          ease: "none",
          duration: FRAME_PLAY,
          onUpdate() {
            if (heroDismissed) return;
            const clamped = Math.min(Math.round(frameObj.frame), ROTATION_END_FRAME);
            if (clamped !== currentFrame) {
              currentFrame = clamped;
              drawFrame(currentFrame);
            }
          },
          onComplete: lockRotationFrame,
        },
        0
      );

      tl.to(
        lineRef.current,
        { scaleX: 1, autoAlpha: 1, duration: 0.5, ease: "power2.out" },
        TITLE_IN_AT - 0.15
      );

      tl.to(
        headlineRef.current,
        { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" },
        TITLE_IN_AT
      );

      const exitStart = FRAME_PLAY + TITLE_HOLD;

      tl.to(
        scrollHintRef.current,
        { autoAlpha: 0, duration: 0.35, ease: "power2.in" },
        exitStart - 0.1
      );

      tl.to(
        [headlineRef.current, lineRef.current],
        {
          autoAlpha: 0,
          y: -28,
          duration: FADE_OUT,
          ease: "power2.in",
          stagger: 0.04,
        },
        exitStart
      );

      tl.to(
        particlesCanvas,
        {
          autoAlpha: 0,
          duration: FADE_OUT * 0.85,
          ease: "power2.in",
          onComplete: () => cancelAnimationFrame(rafId),
        },
        exitStart
      );

      tl.to(
        canvas,
        { autoAlpha: 0, duration: FADE_OUT, ease: "power2.in" },
        exitStart + 0.08
      );

      tl.to(
        heroVisualsRef.current,
        { autoAlpha: 0, duration: FADE_OUT * 0.6, ease: "power2.in" },
        exitStart + FADE_OUT * 0.4
      );

      tl.call(lockRotationFrame, undefined, exitStart);

      gsap.to(loadingRef.current, {
        autoAlpha: 0,
        duration: 1.4,
        ease: "power2.inOut",
        delay: 0.2,
      });

      gsap.fromTo(
        scrollHintRef.current,
        { autoAlpha: 0, y: 10 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.0,
          ease: "power2.out",
          delay: 1.4,
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

    setupCanvas();
    let loaded = 0;

    for (let i = 1; i <= HERO_FRAME_COUNT; i++) {
      const img = new Image();
      img.src = frameSrc(i);
      const onSettled = () => {
        loaded++;
        const pct = Math.round((loaded / HERO_FRAME_COUNT) * 100);
        if (loadingBarRef.current) loadingBarRef.current.style.width = `${pct}%`;
        if (loadingPctRef.current) loadingPctRef.current.textContent = `${pct}`;
        if (loaded === HERO_FRAME_COUNT) initAnimations();
      };
      img.onload = onSettled;
      img.onerror = onSettled;
      images.push(img);
    }

    const handleResize = () => {
      setupCanvas();
      if (!heroDismissed) {
        drawFrame(currentFrame);
      }
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
      <div
        ref={loadingRef}
        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
      >
        <div className="flex flex-col items-center gap-8 w-64">
          <span className="text-[10px] tracking-[0.5em] uppercase text-zinc-600 font-light">
            Loading
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

      <section
        ref={sectionRef}
        data-pizza-section="hero"
        className="relative w-full bg-black overflow-hidden"
        style={{ height: "100vh" }}
      >
        <div ref={heroVisualsRef} className="absolute inset-0">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 1 }}
          />

          <canvas
            ref={particlesCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 2 }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 3,
              background:
                "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 35%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.88) 100%)",
            }}
          />

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

          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ zIndex: 5 }}
          >
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
          </div>

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
        </div>
      </section>
    </>
  );
}
