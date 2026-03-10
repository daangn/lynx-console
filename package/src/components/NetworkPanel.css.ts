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
  padding: "6px 12px",
  backgroundColor: vars.$color.bg.neutralWeak,
  borderRadius: 4,
});

export const clearButtonText = style({
  ...typography("t3", "medium"),
  color: vars.$color.fg.neutral,
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

export const item = recipe({
  base: {
    padding: "8px",
    borderBottomWidth: 1,
    borderBottomColor: vars.$color.stroke.neutralWeak,
    borderBottomStyle: "solid",
  },
  variants: {
    status: {
      pending: {
        backgroundColor: vars.$color.palette.gray100,
      },
      success: {},
      error: {
        backgroundColor: vars.$color.palette.red100,
      },
    },
  },
});

export const itemHeader = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 4,
  gap: 8,
});

export const method = recipe({
  base: {
    ...typography("t2", "bold"),
    padding: "0 4px",
    borderRadius: 2,
    color: vars.$color.fg.neutral,
    backgroundColor: vars.$color.bg.neutralWeak,
  },
  variants: {
    type: {
      GET: {
        color: vars.$color.palette.blue600,
        backgroundColor: vars.$color.palette.blue100,
      },
      POST: {
        color: vars.$color.palette.green600,
        backgroundColor: vars.$color.palette.green100,
      },
      PUT: {
        color: vars.$color.palette.yellow600,
        backgroundColor: vars.$color.palette.yellow100,
      },
      PATCH: {
        color: vars.$color.palette.purple600,
        backgroundColor: vars.$color.palette.purple100,
      },
      DELETE: {
        color: vars.$color.palette.red600,
        backgroundColor: vars.$color.palette.red100,
      },
    },
  },
});

export const statusCode = recipe({
  base: {
    ...typography("t2", "bold"),
  },
  variants: {
    type: {
      success: {
        color: vars.$color.palette.green600,
      },
      error: {
        color: vars.$color.palette.red600,
      },
      pending: {
        color: vars.$color.fg.neutralSubtle,
      },
    },
  },
});

export const time = style({
  ...typography("t2", "regular"),
  color: vars.$color.fg.neutralSubtle,
});

export const url = style({
  ...typography("t3", "regular"),
  color: vars.$color.fg.neutral,
  wordBreak: "break-all",
  marginBottom: 4,
});

export const path = style({
  ...typography("t3", "regular"),
  color: vars.$color.fg.neutral,
  wordBreak: "break-all",
  whiteSpace: "pre-wrap",
  overflow: "visible",
  marginBottom: 4,
});

export const details = style({
  ...typography("t3", "regular"),
  color: vars.$color.fg.neutralSubtle,
});

export const detailsContainer = style({
  marginTop: 12,
  paddingTop: 12,
  borderTopWidth: 1,
  borderTopColor: vars.$color.stroke.neutralSubtle,
  borderTopStyle: "solid",
});

export const tabs = style({
  display: "flex",
  flexDirection: "row",
  gap: 4,
  paddingBottom: 6,
});

export const tab = recipe({
  base: {
    padding: "4px 8px",
    borderRadius: 4,
    cursor: "pointer",
  },
  variants: {
    active: {
      true: {
        backgroundColor: vars.$color.bg.neutralWeak,
      },
      false: {
        backgroundColor: "transparent",
      },
    },
  },
});

export const tabText = recipe({
  base: {
    ...typography("t4", "medium"),
  },
  variants: {
    active: {
      true: {
        color: vars.$color.fg.neutral,
      },
      false: {
        color: vars.$color.fg.neutralSubtle,
      },
    },
  },
});

export const tabContent = style({
  paddingTop: 8,
});

export const detailSection = style({
  marginBottom: 12,
});

export const detailSectionTitle = style({
  ...typography("t3", "bold"),
  color: vars.$color.fg.neutral,
  marginBottom: 8,
});

export const table = style({
  display: "flex",
  flexDirection: "column",
  gap: 4,
});

export const tableRow = style({
  display: "flex",
  flexDirection: "row",
  gap: 8,
  padding: "4px 8px",
  backgroundColor: vars.$color.bg.neutralWeak,
  borderRadius: 2,
});

export const tableKey = style({
  ...typography("t3", "bold"),
  color: vars.$color.fg.neutralSubtle,
  minWidth: 70,
  flexShrink: 0,
});

export const tableValue = style({
  ...typography("t3", "regular"),
  color: vars.$color.fg.neutral,
  wordBreak: "break-all",
  flex: 1,
});

export const bodyText = style({
  ...typography("t3", "regular"),
  color: vars.$color.fg.neutral,
  padding: 8,
  backgroundColor: vars.$color.bg.neutralWeak,
  borderRadius: 4,
  wordBreak: "break-all",
  whiteSpace: "pre-wrap",
});

export const errorText = style({
  ...typography("t3", "regular"),
  color: vars.$color.palette.red600,
  padding: 8,
  backgroundColor: vars.$color.palette.red100,
  borderRadius: 4,
  wordBreak: "break-all",
});

export const emptyText = style({
  ...typography("t3", "regular"),
  color: vars.$color.fg.disabled,
  textAlign: "center",
  padding: "16px 0",
});
