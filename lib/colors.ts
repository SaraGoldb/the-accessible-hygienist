// Tailwind utility classes can't be built from a runtime variable
// (e.g. `text-${color}`) unless the exact string is statically present
// in source or safelisted. For the handful of places where color is
// genuinely chosen at runtime (mood badges, urgency flags, plan sections),
// it's simpler and more reliable to keep one small hex map and apply it
// via inline style, rather than fight Tailwind's static analysis.
// Keys match the Tailwind color names in tailwind.config.ts.
export const COLOR_HEX: Record<string, string> = {
  sage: "#6b9a78",
  "sage-dark": "#4a7258",
  blue: "#5278a0",
  mauve: "#9a7088",
  red: "#b85c5c",
  orange: "#c17a43",
  amber: "#b88a3a",
  green: "#4e8860",
  teal: "#4a8a8a",
  "ink-light": "#8a857e",
};

export const withAlpha = (hex: string, alpha: string) => `${hex}${alpha}`;