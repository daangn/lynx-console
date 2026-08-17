export const isWebPlatform: boolean =
  typeof SystemInfo !== "undefined" &&
  (SystemInfo.platform as string) === "web";
