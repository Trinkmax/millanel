/**
 * Shared motion presets. The tuples are typed as `const` so motion/react
 * recognises them as cubic-bezier easing rather than generic number[].
 */
export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const;
export const EASE_OUT_STRONG = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT_SMOOTH = [0.4, 0, 0.2, 1] as const;

export const FADE_UP = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, ease: EASE_OUT_SOFT },
};

export const RISE = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.8, ease: EASE_OUT_SOFT },
};
