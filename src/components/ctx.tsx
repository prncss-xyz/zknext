import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useReducer,
  useState,
} from "react";

export function createReducerCtx<S, A>(s: S, reducer: (s: S, a: A) => S) {
  const Context = createContext<[S, Dispatch<A>] | undefined>(undefined);

  function Provider({ children }: { children: ReactNode }) {
    const value = useReducer(reducer, s);
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useCtx() {
    const value = useContext(Context);
    if (!value) throw new Error(`hook must be used in a provider`);
    return value;
  }
  return { Provider, useCtx };
}

export function createStateCtx<S>(init: S) {
  const Context = createContext<[S, Dispatch<SetStateAction<S>>] | undefined>(
    undefined,
  );
  function Provider({ children }: { children: ReactNode }) {
    const value = useState(init);
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useCtx() {
    const value = useContext(Context);
    if (!value) throw new Error(`hook must be used in a provider`);
    return value;
  }
  return { Provider, useCtx };
}

export function createValueCtx<S>() {
  const Context = createContext<[S] | undefined>(undefined);
  function Provider({ children, value }: { children: ReactNode; value: S }) {
    return <Context.Provider value={[value]}>{children}</Context.Provider>;
  }

  function useCtx() {
    const value = useContext(Context);
    if (!value) throw new Error(`hook must be used in a provider`);
    return value[0];
  }
  return { Provider, useCtx };
}
