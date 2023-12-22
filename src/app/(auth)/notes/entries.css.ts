import { vars } from "@/theme.css";
import { style } from "@vanilla-extract/css";

export const selector = style({
  selectors: {
    '&[data-state="on"]': {
      color: vars.colors.active,
    },
  },
});
