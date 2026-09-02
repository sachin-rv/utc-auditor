// Canonical color values for both themes. globals.css mirrors these as CSS
// custom properties (as "R G B" triplets, for Tailwind's rgb(var(...) /
// <alpha-value>) opacity pattern); this module exists so components that
// render raw SVG through a charting library (which needs literal color
// strings, not CSS custom properties) can stay in sync with the same
// palette instead of hardcoding a second copy.
export const THEME_COLORS = {
  dark: {
    ink: "#071110",
    panel: "#0E1817",
    panel2: "#142221",
    line: "#1E322F",
    mist: "#8AA09C",
    chalk: "#E8F2F0",
    onaccent: "#071110",
    pass: "#3ED9C4",
    fail: "#FF6B5E",
    warn: "#F5B942",
    info: "#5EC8D4",
    high: "#FF9B6E",
  },
  light: {
    ink: "#F3F8F7",
    panel: "#FFFFFF",
    panel2: "#EEF5F3",
    line: "#D7E4E1",
    mist: "#5C6A68",
    chalk: "#2C3231",
    onaccent: "#FFFFFF",
    pass: "#0D8F7F",
    fail: "#D63E32",
    warn: "#B27A0F",
    info: "#1A8F9E",
    high: "#C2632B",
  },
} as const;

export type ThemeName = keyof typeof THEME_COLORS;
