import { globalStyle, style } from "@vanilla-extract/css";

export const overlay = style({
  width: "100%",
  height: "100%",
  position: "relative",
});

globalStyle(`${overlay}>*`, {
  position: "absolute",
});
