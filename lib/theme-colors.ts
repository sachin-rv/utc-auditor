// Canonical color values for both themes. globals.css mirrors these as CSS
// custom properties (as "R G B" triplets, for Tailwind's rgb(var(...) /
// <alpha-value>) opacity pattern); this module exists so components that
// render raw SVG through a charting library (which needs literal color
// strings, not CSS custom properties) can stay in sync with the same
// palette instead of hardcoding a second copy.
export const THEME_COLORS = {
  dark: {
    ink: "#0E1013",
    panel: "#15181D",
    panel2: "#1B1F26",
    line: "#272C34",
    mist: "#8A93A3",
    chalk: "#EDEFF3",
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
    mist: "#646A77",
    chalk: "#14161A",
    onaccent: "#14161A",
    pass: "#0F9B6C",
    fail: "#D63E32",
    warn: "#B27A0F",
    info: "#256CC7",
    high: "#C2632B",
  },
} as const;

export type ThemeName = keyof typeof THEME_COLORS;
