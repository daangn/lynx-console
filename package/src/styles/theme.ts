export type Theme = "light" | "dark";

const lightColors = {
  palette: {
    blue100: "#eff6ff",
    blue600: "#5e98fe",
    gray100: "#f7f8f9",
    gray400: "#dcdee3",
    green100: "#edfaf6",
    green600: "#10ab7d",
    purple100: "#f5f3fe",
    purple600: "#9f84fb",
    red100: "#fdf0f0",
    red600: "#fc6a66",
    red900: "#921708",
    staticWhite: "#ffffff",
    yellow100: "#fff7de",
    yellow600: "#c49725",
    yellow900: "#4f3e1f",
  },
  fg: {
    neutral: "#1a1c20",
    placeholder: "#b0b3ba",
    disabled: "#d1d3d8",
    neutralMuted: "#555d6d",
    neutralSubtle: "#868b94",
  },
  bg: {
    overlay: "#00000074",
    layerDefault: "#ffffff",
    layerFloating: "#ffffff",
    neutralWeak: "#f3f4f5",
  },
  stroke: {
    neutralSubtle: "#0000000c",
    neutralWeak: "#dcdee3",
  },
} as const;

const darkColors = {
  palette: {
    blue100: "#202742",
    blue600: "#1e82eb",
    gray100: "#16171b",
    gray400: "#393d46",
    green100: "#202926",
    green600: "#1b946d",
    purple100: "#28213b",
    purple600: "#8e6bee",
    red100: "#322323",
    red600: "#f73526",
    red900: "#f8c5c3",
    staticWhite: "#ffffff",
    yellow100: "#302819",
    yellow600: "#b6720d",
    yellow900: "#e5d49b",
  },
  fg: {
    neutral: "#f3f4f5",
    placeholder: "#868b94",
    disabled: "#5b606a",
    neutralMuted: "#dcdee3",
    neutralSubtle: "#b0b3ba",
  },
  bg: {
    overlay: "#00000074",
    layerDefault: "#16171b",
    layerFloating: "#1d2025",
    neutralWeak: "#2b2e35",
  },
  stroke: {
    neutralSubtle: "#ffffff0d",
    neutralWeak: "#393d46",
  },
} as const;

const colorMap = {
  light: lightColors,
  dark: darkColors,
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  bold: "700",
} as const;

export const duration = {
  d4: "200ms",
  d6: "300ms",
} as const;

export function getColors(theme: Theme) {
  return colorMap[theme];
}

export type ThemeColors = ReturnType<typeof getColors>;
