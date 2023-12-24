import { RefObject, useEffect, useRef } from "react";

/**
 * hook to implement clickOutside events
 */
export function useClickOutside(onClickOutside: () => void) {
  const ref: RefObject<HTMLDivElement> = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside && onClickOutside();
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [onClickOutside]);
  return ref;
}
