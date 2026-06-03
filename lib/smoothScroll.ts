export function smoothScrollTo(id: string, offset = 80): void {
  const el = document.getElementById(id);
  if (!el) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top =
    el.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top,
    behavior: reduced ? "auto" : "smooth",
  });
}
