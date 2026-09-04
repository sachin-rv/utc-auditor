// Canonical color values for both themes. globals.css mirrors these as CSS
// custom properties (as "R G B" triplets, for Tailwind's rgb(var(...) /
// <alpha-value>) opacity pattern); this module exists so components that
// render raw SVG through a charting library (which needs literal color
// strings, not CSS custom properties) can stay in sync with the same
// palette instead of hardcoding a second copy.
export const THEME_COLORS = {
  dark: {
    ink: "#071011",
    panel: "#0D1C1F",
    panel2: "#112627",
    line: "#324E50",
    mist: "#D2E0DD",
    chalk: "#F7FCFB",
    onaccent: "#0E1013",
    pass: "#3ED598",
    fail: "#FF6B5E",
    warn: "#F5B942",
    info: "#5FA8FF",
    high: "#FF9B6E",
  },
  light: {
    ink: "#F6F7F9",
    panel: "#FFFFFF",
    panel2: "#F1F2F5",
    line: "#E2E5EA",
    mist: "#374B47",
    chalk: "#081614",
    onaccent: "#14161A",
    pass: "#0F9B6C",
    fail: "#D63E32",
    warn: "#B27A0F",
    info: "#256CC7",
    high: "#C2632B",
  },
} as const;

export type ThemeName = keyof typeof THEME_COLORS;
