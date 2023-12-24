import { ButtonOpt, ButtonOptProps } from "./buttonOpt";

export function SmallButtonOpt(params: ButtonOptProps) {
  return (
    <ButtonOpt
      width="navCheckboxWidth"
      height="navCheckboxWidth"
      display="flex"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      {...params}
    />
  );
}
