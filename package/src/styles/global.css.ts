import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./vars";

globalStyle("page", {
  backgroundColor: vars.$color.bg.layerDefault,
  fontSize: "16px",
});
globalStyle("text", {
  color: vars.$color.fg.neutral,
});
