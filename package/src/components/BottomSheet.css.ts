import { style } from "@vanilla-extract/css";
import { typography } from "../styles/typography";
import { vars } from "../styles/vars";

export const overlay = style({
  position: "fixed",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-end",
  zIndex: 3,
});

export const backdrop = style({
  position: "fixed",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  zIndex: 2,
  background: vars.$color.bg.overlay,
  transition: `opacity ${vars.$duration.d6} cubic-bezier(0.4, 0, 0.2, 1)`,
});

export const content = style({
  position: "relative",
  display: "flex",
  flex: 1,
  flexDirection: "column",
  boxSizing: "border-box",
  wordBreak: "break-all",
  background: vars.$color.bg.layerFloating,
  borderTopLeftRadius: vars.$radius.r6,
  borderTopRightRadius: vars.$radius.r6,
  transition: `transform ${vars.$duration.d6} cubic-bezier(0.4, 0, 0.2, 1)`,
  height: "500px",
  overflow: "hidden",
});

export const handleContainer = style({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "48px",
  display: "flex",
  justifyContent: "center",
  zIndex: 10,
});

export const handle = style({
  width: "36px",
  height: 4,
  backgroundColor: vars.$color.palette.gray400,
  borderRadius: "9999px",
  marginTop: "12px",
});

export const header = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.$dimension.x2,
  paddingTop: vars.$dimension.x6,
  paddingBottom: vars.$dimension.x4,
  justifyContent: "flex-start",
  paddingLeft: vars.$dimension.spacingX.globalGutter,
  paddingRight: "50px",
});

export const title = style({
  ...typography("t7", "bold"),
  color: vars.$color.fg.neutral,
});

export const body = style({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  padding: `0 ${vars.$dimension.x4}`,
  overflow: "hidden",
});

export const footer = style({
  display: "flex",
  flexDirection: "column",
  paddingLeft: vars.$dimension.spacingX.globalGutter,
  paddingRight: vars.$dimension.spacingX.globalGutter,
  paddingTop: vars.$dimension.x3,
  paddingBottom: vars.$dimension.x4,
});
