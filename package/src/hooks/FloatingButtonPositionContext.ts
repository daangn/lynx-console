import { createContext } from "@lynx-js/react";

export interface InitialPosition {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

export const FloatingButtonPositionContext = createContext<
  InitialPosition | undefined
>(undefined);
