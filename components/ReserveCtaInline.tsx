"use client";

import { smoothScrollTo } from "@/lib/smoothScroll";

export default function ReserveCtaInline() {
  return (
    <div className="flex w-full justify-center py-12 md:py-20">
      <button
        type="button"
        onClick={() => smoothScrollTo("reservation", 80)}
        className="mx-auto max-w-[calc(100%-48px)] border border-brand-gold bg-transparent px-10 py-4 font-[family-name:var(--font-cinematic,serif)] text-sm uppercase tracking-[0.25em] text-brand-gold transition-colors duration-200 ease-in-out hover:bg-brand-gold hover:text-[#0a0a0a]"
      >
        Reserve a Table
      </button>
    </div>
  );
}
