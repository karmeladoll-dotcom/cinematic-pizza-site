"use client";

import { useEffect, useState } from "react";
import { smoothScrollTo } from "@/lib/smoothScroll";

export default function ReserveCtaProminent() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={() => smoothScrollTo("reservation", 80)}
        className={[
          "mx-auto max-w-[calc(100%-48px)] bg-brand-gold px-12 py-5 font-[family-name:var(--font-cinematic,serif)] text-base uppercase tracking-[0.2em] text-[#0a0a0a] shadow-[0_0_30px_-8px_rgba(251,191,36,0.4)] transition-[transform,box-shadow] duration-[250ms] ease-in-out hover:shadow-[0_0_30px_-8px_rgba(251,191,36,0.6)]",
          reducedMotion ? "" : "hover:scale-[1.02]",
        ].join(" ")}
      >
        Reserve Yours
      </button>
    </div>
  );
}
