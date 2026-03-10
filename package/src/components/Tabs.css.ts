import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { typography } from "../styles/typography";
import { vars } from "../styles/vars";

export const tabs = style({
  flex: 1,
  display: "flex",
  flexDirection: "column",
});

export const tabHeader = style({
  display: "flex",
  boxShadow: `inset 0 -1px 0 0 ${vars.$color.stroke.neutralSubtle}`,
});

export const tabTriggerButton = style({
  flex: 1,
  color: vars.$color.fg.neutralSubtle,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "12px 0 10px 0",
  position: "relative",
});

export const tabTriggerButtonText = recipe({
  base: {
    ...typography("t5", "bold"),
    color: vars.$color.fg.neutralSubtle,
  },
  variants: {
    active: {
      true: {
        color: vars.$color.fg.neutral,
      },
    },
  },
});

export const tabTriggerIndicator = style({
  position: "absolute",
  bottom: 0,
  left: 0,
  padding: "0 16px",
  width: "100%",
  transition: "200ms",
  transitionTimingFunction: "cubic-bezier(.35, 0, .35, 1)",
});

export const tabTriggerIndicatorLine = style({
  backgroundColor: vars.$color.fg.neutral,
  width: "100%",
  height: "2px",
});

export const tabContents = style({
  flex: 1,
  width: "100%",
});

export const tabContent = style({
  width: "100%",
  display: "flex",
  flexDirection: "column",
});
