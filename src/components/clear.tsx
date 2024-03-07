import { ButtonOpt, ButtonOptProps } from "./buttonOpt";
import { LuDelete } from "react-icons/lu";

// Omit<ButtonOptProps, "children"> not working properly
export function Clear(params: ButtonOptProps) {
  return (
    <ButtonOpt style={{position: "relative", top: 3}} {...params}>
      <LuDelete />
    </ButtonOpt>
  );
}
