export const space = [0, 2, 5, 10, 20, 40] as const;

export const sizes = {
  screenMaxWidth: 800,
  labelWidth: 100,
  buttonHeight: 20,
  navCheckboxWidth : 15,
  fieldWidth: 100,
  navInputWidth: 160,
  "100%": "100%",
  "100vh": "100vh",
  "100vw": "100vw",
  menuIcon: 30,
  overlayNoteWidth: 400,
};

export const fontSizes = [
  12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96, 128,
] as const;

export const borderRadii = [0, 2, 5, 10] as const;

export const fontWeights = { bold: 700 };

export const borderWidths = [0, 1, 2, 5] as const;

// this is used to set up theme vars; what is not defined in _dark defaults to values from _light
// don't these values directly, use sprinkles or vars.colors from theme.css instead
// colors used this way will respond to (prefers-color-scheme) media queries
// background and colors are also set as background color and default color

export const _light = {
  text: "hsl(0, 0%, 30%)",
  muted: "hsl(0, 0%, 45%)",
  disabled: "hsl(0, 0%, 10%)",
  link: "hsl(260, 80%, 63%)",
  foreground1: "hsl(150, 10%, 80%)",
  active: "hsl(40, 60%, 50%)",
  foreground2: "hsl(150, 10%, 70%)",
  background: "hsl(150, 10%, 50%)",
  error: "pink",
};

export const _dark = {
  text: "hsl(0, 0%, 65%)",
  muted: "hsl(0, 0%, 50%)",
  disabled: "hsl(0, 0%, 35%)",
  link: "hsl(260, 80%, 60%)",
  foreground1: "hsl(150, 10%, 25%)",
  active: "hsl(40, 50%, 40%)",
  foreground2: "hsl(150, 10%, 17%)",
  background: "hsl(150, 10%, 10%)",
  error: "pink",
};
