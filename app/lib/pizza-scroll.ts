/**
 * pizza-scroll.ts
 *
 * Architecture stub for the future continuous pizza storytelling effect.
 *
 * VISION
 * ------
 * As the user scrolls through the full page the pizza transitions seamlessly
 * between sections — emerging from the hero, floating into the story section,
 * exploding into ingredients, reforming above the reservation CTA.  Each
 * section "owns" a chapter of the pizza's journey.
 *
 * HOW TO WIRE IT UP (when ready to implement)
 * --------------------------------------------
 * 1. Wrap the app in <PizzaScrollProvider> (see provider stub below).
 * 2. In CinematicScene.tsx uncomment the [PIZZA-SCROLL-HOOK] lines.
 * 3. In each subsequent section, call `usePizzaScroll()` to read `progress`
 *    and `chapter`, then drive your section-specific GSAP animation.
 *
 * SECTION CHAPTERS
 * ----------------
 * "hero"        → Hero image sequence (frames 0–120)
 * "story"       → Pizza floats up, soft-focus letterbox fades
 * "ingredients" → Pizza disassembles into toppings
 * "pizzas"      → Multiple pizza cards spiral in
 * "reservation" → Pizza reassembles as the final CTA backdrop
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PizzaChapter =
  | "hero"
  | "story"
  | "ingredients"
  | "pizzas"
  | "reservation";

export interface PizzaScrollState {
  /** Normalised scroll progress within the current chapter (0–1). */
  progress: number;
  /** Which page section is currently active. */
  chapter: PizzaChapter;
  /** Raw hero frame index (0 – TOTAL_FRAMES-1), useful for deep-linking. */
  heroFrame: number;
}

// ---------------------------------------------------------------------------
// Default / initial state
// ---------------------------------------------------------------------------

export const INITIAL_PIZZA_SCROLL_STATE: PizzaScrollState = {
  progress: 0,
  chapter: "hero",
  heroFrame: 0,
};

// ---------------------------------------------------------------------------
// Chapter → section selector mapping
// Each entry describes which DOM element triggers the chapter transition.
// ---------------------------------------------------------------------------

export const CHAPTER_SELECTORS: Record<PizzaChapter, string> = {
  hero: "[data-pizza-section='hero']",
  story: "[data-pizza-section='story']",
  ingredients: "[data-pizza-section='ingredients']",
  pizzas: "[data-pizza-section='pizzas']",
  reservation: "[data-pizza-section='reservation']",
};

// ---------------------------------------------------------------------------
// Emit helper (stub — swap for a Zustand / Jotai atom or React context later)
// ---------------------------------------------------------------------------

type PizzaScrollListener = (state: PizzaScrollState) => void;

let _listeners: PizzaScrollListener[] = [];
let _state: PizzaScrollState = { ...INITIAL_PIZZA_SCROLL_STATE };

export function pizzaScrollEmit(partial: Partial<PizzaScrollState>): void {
  _state = { ..._state, ...partial };
  _listeners.forEach((fn) => fn(_state));
}

export function pizzaScrollSubscribe(fn: PizzaScrollListener): () => void {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
}

export function getPizzaScrollState(): PizzaScrollState {
  return _state;
}
