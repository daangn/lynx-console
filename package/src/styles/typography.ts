import { type DimensionTokenId, getDimensionValue } from "./getDimensionValue";
import { vars } from "./vars";

type TypographyTokenId =
  Extract<
    DimensionTokenId,
    `$font-size.${string}`
  > extends `$font-size.${infer U}`
    ? U
    : never;

export function typography(
  tokenId: TypographyTokenId,
  weight: "regular" | "medium" | "bold",
) {
  const fontSize = getDimensionValue(`$font-size.${tokenId}`);
  const lineHeight = getDimensionValue(`$line-height.${tokenId}`);
  const fontWeight = vars.$fontWeight[weight];

  return {
    fontSize,
    lineHeight,
    fontWeight,
  };
}
