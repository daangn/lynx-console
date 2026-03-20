import { createContext, useContext } from "@lynx-js/react";
import { type ThemeColors, getColors } from "./theme";

const ThemeContext = createContext<ThemeColors>(getColors("light"));

export const ThemeProvider = ThemeContext.Provider;

export function useThemeColors(): ThemeColors {
  return useContext(ThemeContext);
}
