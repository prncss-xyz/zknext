import { vars } from "@/theme.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const luLink = style({
  verticalAlign: "top",
  position: "relative",
  top: "1px",
  paddingRight: "2px",
});

export const luExternalLink = style({
  verticalAlign: "top",
  position: "relative",
  top: "2px",
  paddingRight: "2px",
});

export const contents = style({});
// https://www.w3schools.com/cssref/css_default_values.php

globalStyle(`${contents}>*:first-child`, {
  marginTop: 0,
});

globalStyle(`${contents}>*:last-child`, {
  marginBottom: 0,
});

globalStyle(`${contents} h1`, {
  fontSize: "2em",
  marginTop: "0.67em",
  marginBottom: "0,67em",
  fontWeight: "bold",
});

globalStyle(`${contents} h2`, {
  fontSize: "1.5em",
  marginTop: "0.83em",
  marginBottom: "0,83em",
  fontWeight: "bold",
});

globalStyle(`${contents} h3`, {
  fontSize: "1.17em",
  marginTop: "1em",
  marginBottom: "1em",
  fontWeight: "bold",
});

globalStyle(`${contents} h4`, {
  marginTop: "1.33em",
  marginBottom: "1.33em",
  fontWeight: "bold",
});

globalStyle(`${contents} h5`, {
  fontSize: "0.83em",
  marginTop: "1.67em",
  marginBottom: "1,67em",
  fontWeight: "bold",
});

globalStyle(`${contents} h6`, {
  fontSize: "0.67em",
  marginTop: "0.5em",
  marginBottom: "0,5em",
  fontWeight: "bold",
});

globalStyle(`${contents} p`, {
  marginTop: "1em",
  marginBottom: "1em",
});

globalStyle(`${contents} small`, {
  fontSize: "80%",
});

globalStyle(`${contents} sup`, {
  position: "relative",
  top: "-0.5em",
  fontSize: "80%",
});

globalStyle(`${contents} sub`, {
  position: "relative",
  top: "0.5em",
  fontSize: "80%",
});

globalStyle(`${contents} blockquote`, {
  marginLeft: 40,
  marginRight: 40,
  fontSize: "90%",
});

globalStyle(`${contents} ul, ${contents} ol`, {
  // display: "block",
  marginTop: "1em",
  marginBottom: "1em",
  marginLeft: 0,
  marginRight: 0,
  paddingLeft: 40,
});

globalStyle(`${contents} ul`, {
  listStyleType: "disc",
});

globalStyle(`${contents} ol`, {
  listStyleType: "decimal",
});

globalStyle(`${contents} li`, {
  // display: "list-item",
});

globalStyle(`${contents} hr`, {
  // display: "block",
  marginTop: "0.5em",
  marginBottom: "0.5em",
  marginLeft: "auto",
  marginRight: "auto",
  borderStyle: "inset",
  borderWidth: "1px",
});

globalStyle(`${contents} dl`, {
  marginTop: "1",
  marginBottom: "1",
});

globalStyle(`${contents} mark`, {
  backgroundColor: vars.colors.active,
});

globalStyle(`${contents} mark`, {
  backgroundColor: vars.colors.active,
});

globalStyle(`${contents} table`, {
  borderColor: vars.colors.text,
  borderCollapse: "collapse",
});

globalStyle(`${contents} thead`, {
  textAlign: "center",
});

globalStyle(`${contents} table, ${contents} th, ${contents} td`, {
  borderStyle: "solid",
  borderWidth: 1,
});

globalStyle(`${contents} th, ${contents} td`, {
  padding: 2,
});
