import { dimensions } from "./tokens.json";

export type DimensionTokenId = keyof typeof dimensions;

export function getDimensionValue(tokenId: DimensionTokenId) {
  return dimensions[tokenId];
}
