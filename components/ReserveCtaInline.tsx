"use client";

import { smoothScrollTo } from "@/lib/smoothScroll";

export default function ReserveCtaInline() {
  return (
    <div className="flex w-full justify-center py-12 md:py-20">
      <button
        type="button"
        onClick={() => smoothScrollTo("reservation", 80)}
        className="mx-auto max-w-[calc(100%-48px)] border-2 border-brand-gold bg-transparent px-16 py-6 font-[family-name:var(--font-cinematic,serif)] text-base uppercase tracking-[0.35em] text-brand-gold shadow-[0_0_24px_-10px_rgba(251,191,36,0.3)] transition-[color,background-color,box-shadow] duration-200 ease-in-out hover:bg-brand-gold hover:text-[#0a0a0a] hover:shadow-[0_0_28px_-8px_rgba(251,191,36,0.5)]"
      >
        Reserve a Table
      </button>
    </div>
  );
}
