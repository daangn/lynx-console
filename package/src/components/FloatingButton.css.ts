import { style } from "@vanilla-extract/css";
import { typography } from "../styles/typography";
import { vars } from "../styles/vars";

export const wrapper = style({
  position: "fixed",
  zIndex: 9999,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "8px",
  overflow: "visible",
  transition: `transform ${vars.$duration.d4} cubic-bezier(0.4, 0, 0.2, 1)`,
});

export const button = style({
  position: "relative",
  overflow: "hidden",
  paddingLeft: "8px",
  paddingRight: "8px",
  paddingTop: "4px",
  paddingBottom: "4px",
  borderRadius: "12px",
  backgroundColor: vars.$color.palette.green600,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "2px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
});

export const shineOverlay = style({
  position: "absolute",
  top: "-50%",
  left: "-25%",
  width: "150%",
  height: "200%",
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  borderRadius: "9999px",
});

export const title = style({
  ...typography("t4", "regular"),
  color: vars.$color.palette.staticWhite,
  textAlign: "center",
});

export const subtitle = style({
  ...typography("t3", "regular"),
  color: vars.$color.palette.staticWhite,
  textAlign: "center",
});

export const reloadButton = style({
  overflow: "visible",
  width: "32px",
  height: "32px",
  borderRadius: "16px",
  backgroundColor: vars.$color.palette.green600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
});

export const reloadIcon = style({
  fontSize: "20px",
  lineHeight: "32px",
  marginBottom: "5px",
  color: vars.$color.palette.staticWhite,
  textAlign: "center",
});
