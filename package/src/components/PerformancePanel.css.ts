import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { typography } from "../styles/typography";
import { vars } from "../styles/vars";

export const container = style({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  paddingTop: 4,
});

export const header = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
  paddingBottom: 4,
  borderBottomWidth: 1,
  borderBottomColor: vars.$color.stroke.neutralSubtle,
  borderBottomStyle: "solid",
});

export const count = style({
  ...typography("t3", "regular"),
  color: vars.$color.fg.neutralSubtle,
});

export const clearButton = style({
  padding: "3px 6px",
  backgroundColor: vars.$color.bg.neutralWeak,
  borderRadius: 4,
});

export const clearButtonText = style({
  ...typography("t3", "medium"),
  color: vars.$color.fg.neutralMuted,
});

export const list = style({
  flex: 1,
});

export const placeholder = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
});

export const placeholderText = style({
  ...typography("t4", "regular"),
  color: vars.$color.fg.disabled,
});

export const item = style({
  padding: "8px",
  borderBottomWidth: 1,
  borderBottomColor: vars.$color.stroke.neutralWeak,
  borderBottomStyle: "solid",
});

export const itemHeader = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 4,
  gap: 8,
});

export const entryType = recipe({
  base: {
    ...typography("t2", "bold"),
    padding: "0 6px",
    borderRadius: 2,
    color: vars.$color.fg.neutral,
    backgroundColor: vars.$color.bg.neutralWeak,
  },
  variants: {
    type: {
      init: {
        color: vars.$color.palette.blue600,
        backgroundColor: vars.$color.palette.blue100,
      },
      metric: {
        color: vars.$color.palette.green600,
        backgroundColor: vars.$color.palette.green100,
      },
      pipeline: {
        color: vars.$color.palette.purple600,
        backgroundColor: vars.$color.palette.purple100,
      },
      resource: {
        color: vars.$color.palette.yellow600,
        backgroundColor: vars.$color.palette.yellow100,
      },
    },
  },
});

export const entryName = style({
  ...typography("t2", "medium"),
  color: vars.$color.fg.neutral,
});

export const timestamp = style({
  ...typography("t2", "regular"),
  color: vars.$color.fg.neutralSubtle,
});

export const fcpMetricHeader = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
});

export const fcpHighlight = style({
  ...typography("t3", "bold"),
  color: vars.$color.palette.blue600,
  backgroundColor: vars.$color.palette.blue100,
  padding: "4px 8px",
  borderRadius: 4,
  marginTop: 4,
});

export const metrics = style({
  marginTop: 8,
  display: "flex",
  flexDirection: "column",
  gap: 4,
});

export const metric = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  padding: "4px 8px",
  backgroundColor: vars.$color.bg.neutralWeak,
  borderRadius: 2,
});

export const metricName = style({
  ...typography("t3", "medium"),
  color: vars.$color.fg.neutralSubtle,
  minWidth: 100,
  flexShrink: 0,
});

export const metricValue = style({
  ...typography("t3", "bold"),
  color: vars.$color.palette.green600,
  flex: 1,
});

export const detailsContainer = style({
  marginTop: 12,
  display: "flex",
  flexDirection: "column",
  gap: 12,
});

export const fcpSection = style({
  display: "flex",
  flexDirection: "column",
  gap: 8,
});

export const fcpSectionDescription = style({
  ...typography("t3", "regular"),
  color: vars.$color.fg.neutralSubtle,
  marginBottom: 4,
});

export const fcpMetric = style({
  backgroundColor: vars.$color.bg.layerDefault,
  borderRadius: 4,
  display: "flex",
  flexDirection: "column",
  gap: 4,
});

export const fcpMetricName = style({
  ...typography("t2", "bold"),
  color: vars.$color.fg.neutral,
});

export const fcpMetricValue = style({
  ...typography("t1", "bold"),
  color: vars.$color.palette.blue600,
});

export const fcpMetricDescription = style({
  ...typography("t3", "regular"),
  color: vars.$color.fg.neutralSubtle,
});

export const fcpMetricFormula = style({
  ...typography("t4", "regular"),
  color: vars.$color.fg.disabled,
  fontFamily: "monospace",
});

export const rawEntrySection = style({
  padding: 12,
  backgroundColor: vars.$color.bg.neutralWeak,
  borderRadius: 4,
});

export const detailTitle = style({
  ...typography("t3", "bold"),
  color: vars.$color.fg.neutral,
  marginBottom: 8,
});

export const rawEntry = style({
  ...typography("t3", "regular"),
  color: vars.$color.fg.neutralSubtle,
  fontFamily: "monospace",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
});
