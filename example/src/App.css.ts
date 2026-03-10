import { style } from "@vanilla-extract/css";

export const container = style({
  width: "100%",
  height: "100%",
  padding: "16px",
  marginTop: 20,
  marginBottom: 20,
  display: "flex",
  flexDirection: "column",
  gap: 12,
});

export const section = style({
  display: "flex",
  flexDirection: "column",
  gap: 8,
});

export const sectionTitle = style({
  fontSize: 16,
  fontWeight: "bold",
  color: "#2D3748",
  marginBottom: 4,
});

const baseButton = style({
  padding: "12px 16px",
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const buttonText = style({
  fontSize: 14,
  fontWeight: "500",
  textAlign: "center",
});

export const infoText = style({
  fontSize: 12,
  fontWeight: "400",
  color: "#64748B",
  whiteSpace: "pre-wrap",
});

// Console buttons
export const consoleButton = style([
  baseButton,
  {
    backgroundColor: "#F7FAFC",
  },
]);

export const consoleButtonText = style([
  buttonText,
  {
    color: "#4A5568",
  },
]);

// Network buttons
export const getButton = style([
  baseButton,
  {
    backgroundColor: "#EBF8FF",
  },
]);

export const getButtonText = style([
  buttonText,
  {
    color: "#3182CE",
  },
]);

export const postButton = style([
  baseButton,
  {
    backgroundColor: "#F0FFF4",
  },
]);

export const postButtonText = style([
  buttonText,
  {
    color: "#38A169",
  },
]);

export const patchButton = style([
  baseButton,
  {
    backgroundColor: "#FAF5FF",
  },
]);

export const patchButtonText = style([
  buttonText,
  {
    color: "#805AD5",
  },
]);

export const deleteButton = style([
  baseButton,
  {
    backgroundColor: "#FFF5F5",
  },
]);

export const deleteButtonText = style([
  buttonText,
  {
    color: "#E53E3E",
  },
]);
