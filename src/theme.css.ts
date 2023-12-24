import {
  assignVars,
  createThemeContract,
  globalStyle,
  style,
} from "@vanilla-extract/css";
import { _dark, _light } from "./style";

export const vars = createThemeContract({ colors: _light });

globalStyle("del, s, strike", {
  textDecoration: "line-through",
});

globalStyle("b, strong", {
  fontWeight: "bold",
});

globalStyle("em, cite, var, dfn", {
  fontStyle: "italic",
});

globalStyle("ins", {
  textDecoration: "underline",
});

globalStyle("code, pre, kbd, samp", {
  fontFamily: "monospace",
});

globalStyle("button:focus-visible", {
  outlineStyle: "dotted",
  outlineWidth: 1,
});

globalStyle("body", {
  fontSize: 16,
  backgroundColor: vars.colors.background,
  color: vars.colors.text,
});

globalStyle("a, button", {
  color: vars.colors.link,
  fontWeight: "bold",
  cursor: "pointer",
});

globalStyle("a:hover, button:hover", {
  color: vars.colors.active,
});

export const theme = style({
  vars: assignVars(vars, { colors: _light }),
  "@media": {
    ["screen and (prefers-color-scheme: dark)"]: {
      vars: assignVars(vars, { colors: { ..._light, ..._dark } }),
    },
  },
});
