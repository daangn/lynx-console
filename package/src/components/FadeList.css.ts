import { style } from "@vanilla-extract/css";
import { vars } from "../styles/vars";

export const fadeTop = style({
  height: 20,
  marginBottom: -20,
  zIndex: 1,
  background: `linear-gradient(to bottom, ${vars.$color.bg.layerFloating}, #ffffff00)`,
});

export const fadeBottom = style({
  height: 20,
  marginTop: -20,
  zIndex: 1,
  background: `linear-gradient(to top, ${vars.$color.bg.layerFloating}, #ffffff00)`,
});
