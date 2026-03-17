import * as color from "./color";
import * as dimension from "./dimension";
import * as radius from "./radius";

export const vars = {
  $color: color,
  $dimension: dimension,
  $radius: radius,
  $fontWeight: {
    regular: "var(--lynx-console-font-weight-regular)",
    medium: "var(--lynx-console-font-weight-medium)",
    bold: "var(--lynx-console-font-weight-bold)",
  },
  $duration: {
    d4: "var(--lynx-console-duration-d4)",
    d6: "var(--lynx-console-duration-d6)",
  },
};
