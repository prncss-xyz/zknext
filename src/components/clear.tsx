import { ButtonOpt, ButtonOptProps } from "./buttonOpt";
import { LuDelete } from "react-icons/lu";

export function Clear(params: Omit<ButtonOptProps, "children">) {
  return (
    <ButtonOpt style={{position: "relative", top: 3}} {...params}>
      <LuDelete />
    </ButtonOpt>
  );
}
