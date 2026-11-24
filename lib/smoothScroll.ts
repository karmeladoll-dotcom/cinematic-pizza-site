export function smoothScrollTo(id: string, offset = 80): void {
  const el = document.getElementById(id);
  if (!el) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top =
    el.getBoundingClientRect().top + window.scrollY - offset;

  /* Lenis (inertial scroll) owns scrolling when active; fall back to native smooth. */
  const lenis = (window as Window & { __lenis?: { scrollTo: (y: number, o?: { duration?: number }) => void } }).__lenis;
  if (lenis && !reduced) {
    lenis.scrollTo(top, { duration: 1.8 });
    return;
  }

  window.scrollTo({
    top,
    behavior: reduced ? "auto" : "smooth",
  });
}
