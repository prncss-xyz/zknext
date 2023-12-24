import { ButtonOpt, ButtonOptProps } from "./buttonOpt";

export function RoundedButtonOpt(params: ButtonOptProps) {
  return (
    <ButtonOpt
      display="flex"
      flexDirection="row"
      alignItems="baseline"
      justifyContent="center"
      borderRadius={2}
      backgroundColor="foreground2"
      px={5}
      height="buttonHeight"
      {...params}
    />
  );
}
