import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { typography } from "../styles/typography";
import { vars } from "../styles/vars";

export const container = style({
  display: "flex",
  flexDirection: "column",
  height: "100%",
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

export const logContainer = style({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  paddingTop: 4,
});

export const logHeader = style({
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

export const logCount = style({
  ...typography("t3", "regular"),
  color: vars.$color.fg.neutralSubtle,
});

export const filterWrapper = style({
  position: "relative",
});

export const filterButton = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 2,
  padding: "6px 12px",
  backgroundColor: vars.$color.bg.neutralWeak,
  borderRadius: 4,
});

export const filterButtonText = style({
  ...typography("t3", "medium"),
  color: vars.$color.fg.neutral,
});

export const filterButtonArrow = style({
  ...typography("t7", "medium"),
  color: vars.$color.fg.neutral,
});

export const filterOverlay = style({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 99,
});

export const filterDropdown = style({
  position: "absolute",
  top: "100%",
  left: 0,
  marginTop: 4,
  backgroundColor: vars.$color.bg.layerDefault,
  borderWidth: 1,
  borderColor: vars.$color.stroke.neutralSubtle,
  borderStyle: "solid",
  borderRadius: 8,
  padding: "4px 0",
  zIndex: 100,
  minWidth: 90,
});

export const filterOption = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  padding: "8px 12px",
});

export const filterCheckbox = recipe({
  base: {
    ...typography("t3", "medium"),
    width: 16,
  },
  variants: {
    level: {
      log: { color: vars.$color.palette.green600 },
      info: { color: vars.$color.palette.blue600 },
      warn: { color: vars.$color.palette.yellow600 },
      error: { color: vars.$color.palette.red600 },
    },
  },
});

export const filterLabel = recipe({
  base: {
    ...typography("t3", "medium"),
  },
  variants: {
    level: {
      log: { color: vars.$color.palette.green600 },
      info: { color: vars.$color.palette.blue600 },
      warn: { color: vars.$color.palette.yellow600 },
      error: { color: vars.$color.palette.red600 },
    },
  },
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

export const logList = style({
  flex: 1,
});

export const logItem = recipe({
  base: {
    padding: "8px",
    borderBottomWidth: 1,
    borderBottomColor: vars.$color.stroke.neutralWeak,
    borderBottomStyle: "solid",
  },
  variants: {
    level: {
      log: {},
      info: {},
      warn: {
        backgroundColor: vars.$color.palette.yellow100,
      },
      error: {
        backgroundColor: vars.$color.palette.red100,
      },
    },
  },
});

export const logItemHeader = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 4,
});

export const logLevel = recipe({
  base: {
    ...typography("t2", "bold"),
    marginRight: 8,
  },
  variants: {
    level: {
      log: {
        color: vars.$color.palette.green600,
      },
      info: {
        color: vars.$color.palette.blue600,
      },
      warn: {
        color: vars.$color.palette.yellow600,
      },
      error: {
        color: vars.$color.palette.red600,
      },
    },
  },
});

export const logTime = style({
  ...typography("t2", "regular"),
  color: vars.$color.fg.neutralSubtle,
});

export const toggleIndicator = style({
  ...typography("t2", "regular"),
  color: vars.$color.fg.neutralSubtle,
  marginLeft: 4,
  alignSelf: "flex-start",
});

export const logMessage = style({
  ...typography("t3", "regular"),
  color: vars.$color.fg.neutral,
  wordBreak: "break-all",
});

export const logArgsContainer = style({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
});

export const logArgItem = style({
  ...typography("t3", "regular"),
});

export const argNull = style({
  color: vars.$color.fg.neutralSubtle,
});

export const argUndefined = style({
  color: vars.$color.fg.neutralSubtle,
});

export const argString = recipe({
  base: {
    ...typography("t3", "regular"),
  },
  variants: {
    level: {
      log: { color: vars.$color.fg.neutral },
      info: { color: vars.$color.fg.neutral },
      warn: { color: vars.$color.palette.yellow900 },
      error: { color: vars.$color.palette.red900 },
    },
  },
});

export const argPrimitive = recipe({
  base: {
    ...typography("t3", "regular"),
  },
  variants: {
    level: {
      log: { color: vars.$color.palette.blue600 },
      info: { color: vars.$color.palette.blue600 },
      warn: { color: vars.$color.palette.yellow900 },
      error: { color: vars.$color.palette.red900 },
    },
  },
});

export const argObject = style({
  display: "flex",
  flexDirection: "column",
});

export const argObjectHeader = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
});

export const argObjectPreview = style({
  ...typography("t3", "medium"),
  color: vars.$color.fg.neutral,
});

export const argObjectContent = style({
  marginTop: 4,
  display: "flex",
  flexDirection: "column",
  gap: 4,
});

export const argObjectProperty = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
});

export const argObjectKey = style({
  ...typography("t3", "medium"),
  color: vars.$color.palette.purple600,
});

export const argObjectJson = style({
  ...typography("t3", "regular"),
  color: vars.$color.fg.neutral,
});

export const replInputRow = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  paddingTop: 8,
  paddingBottom: 8,
  marginTop: -1,
  borderTopWidth: 1,
  borderTopColor: vars.$color.stroke.neutralSubtle,
  borderTopStyle: "solid",
  backgroundImage: `linear-gradient(to bottom, transparent, ${vars.$color.bg.layerDefault})`,
  backgroundSize: "100% 32px",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "top",
  backgroundColor: vars.$color.bg.layerDefault,
});

export const replPrompt = style({
  ...typography("t10", "medium"),
  color: vars.$color.fg.placeholder,
  paddingBottom: 8,
});

export const replInput = style({
  flex: 1,
  ...typography("t5", "regular"),
  color: vars.$color.fg.neutral,
  caretColor: vars.$color.palette.green600,
  paddingBottom: 8,
});

export const replRunButton = style({
  padding: "4px 10px",
  backgroundColor: vars.$color.palette.green100,
  borderRadius: 4,
  marginBottom: 8,
});

export const replRunButtonText = style({
  ...typography("t3", "medium"),
  color: vars.$color.palette.green600,
});
