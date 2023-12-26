import {
  useMemo,
  useCallback,
  useReducer,
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import * as O from "optics-ts";
import { deepEqual } from "fast-equals";

type Dispatch<s> = (u: (s: s) => s) => void;
function reducer<s>(s: s, u: (s: s) => s) {
  return u(s);
}

export function useLensGet<S, T extends O.OpticParams, A>(
  optic: O.Lens<S, T, A>,
  state: S,
) {
  const value = useMemo(() => O.get(optic)(state), [optic, state]);
  const [value_, setValue] = useState(value);
  useEffect(() => {
    setValue(value);
  }, [value]);
  return value_;
}

export function useLensSet<S, T extends O.OpticParams, A>(
  optic: O.Lens<S, T, A>,
  value: A,
  dispatch: Dispatch<S>,
) {
  return useCallback(
    () => dispatch(O.set(optic)(value)),
    [dispatch, optic, value],
  );
}

export function useLens<S, T extends O.OpticParams, A>(
  optic: O.Lens<S, T, A> | O.Iso<S, T, A>,
  [s, setS]: [s: S, setS: (s: S) => void],
) {
  return useMemo(() => {
    return [
      O.get(optic)(s),
      (value: A) => setS(O.set(optic)(value)(s)),
    ] as const;
  }, [optic, s, setS]);
}

export function useNavLens<S, T extends O.OpticParams, A>(
  target: A,
  optic: O.Lens<S, T, A> | O.Iso<S, T, A>,
  [s, setS]: [s: S, setS: (s: S) => void],
) {
  const [source, setSource] = useLens(optic, [s, setS]);
  const active = deepEqual(source, target);
  const navigate = useCallback(() => setSource(target), [setSource, target]);
  return { active, navigate };
}

export function useToggleLens<S, T extends O.OpticParams>(
  optic: O.Lens<S, T, boolean>,
  [s, setS]: [s: S, setS: (s: S) => void],
) {
  const [active, setSource] = useLens(optic, [s, setS]);
  const toggle = useCallback(() => setSource(!active), [active, setSource]);
  return { active, toggle };
}

/*
export function useGetter_<S, A>(
  optic: O.Getter<S, A>,
  s: S,
) {
  return useMemo(() => O.get(optic)(s), [optic, s]);
}
*/

export function useGetter<S, T extends O.OpticParams, A>(
  optic: O.Lens<S, T, A>,
  s: S,
) {
  return useMemo(() => O.get(optic)(s), [optic, s]);
}

export function usePreview<S, T extends O.OpticParams, A>(
  optic: O.Prism<S, T, A>,
  s: S,
) {
  return useMemo(() => O.preview(optic)(s), [optic, s]);
}

export function useCollect<S, T extends O.OpticParams, A>(
  optic: O.Prism<S, T, A>,
  s: S,
) {
  return useMemo(() => O.collect(optic)(s), [optic, s]);
}

export function useModify<S, T extends O.OpticParams, A>(
  fn: (a: A) => A,
  optic: O.Traversal<S, T, A>,
  [s, setS]: [s: S, setS: (s: S) => void],
) {
  return useCallback(() => {
    setS(O.modify(optic)(fn)(s));
  }, [fn, optic, s, setS]);
}

export function useModifyC<S, T extends O.OpticParams, A>(
  optic: O.Traversal<S, T, A>,
  [s, setS]: [s: S, setS: (s: S) => void],
) {
  return useCallback(
    (fn: (a: A) => A) => {
      setS(O.modify(optic)(fn)(s));
    },
    [optic, s, setS],
  );
}

export function useSet<S, T extends O.OpticParams, A>(
  value: A,
  optic: O.Traversal<S, T, A>,
  [s, setS]: [s: S, setS: (s: S) => void],
) {
  return useCallback(
    () => setS(O.set(optic)(value)(s)),
    [optic, s, setS, value],
  );
}

export function useSetC<S, T extends O.OpticParams, A>(
  optic: O.Traversal<S, T, A>,
  [s, setS]: [s: S, setS: (s: S) => void],
) {
  return useCallback(
    (value: A) => setS(O.set(optic)(value)(s)),
    [optic, s, setS],
  );
}

export function useRemove<S, T extends O.OpticParams, A>(
  optic: O.Prism<S, T, A>,
  [s, setS]: [s: S, setS: (s: S) => void],
) {
  return useCallback(() => {
    setS(O.remove(optic)(s));
  }, [optic, s, setS]);
}
