/* eslint-disable react-hooks/rules-of-hooks */
import { useCallback } from "react";
import * as O from "optics-ts";
import { StoreApi, UseBoundStore } from "zustand";
import { dequal } from "dequal";

const neg = (b: boolean) => !b;

export function createHooks<IState>(
  useBoundStore: UseBoundStore<StoreApi<IState>>,
) {
  return {
    setState: (
      partial:
        | IState
        | Partial<IState>
        | ((state: IState) => IState | Partial<IState>),
      replace?: boolean | undefined,
    ) => useBoundStore.setState(partial, replace),
    get: function <A>(
      o:
        | O.Lens<IState, any, A>
        | O.Iso<IState, any, A>
        | O.Equivalence<IState, any, A>,
    ) {
      return useBoundStore<A>(O.get<IState, A>(o));
    },
    // FIXME: make it one method with get (typing is the issue)
    getter: function <A>(o: O.Getter<IState, A>) {
      return useBoundStore(O.get<IState, A>(o));
    },
    preview: function <A>(
      o: O.Prism<IState, any, A> | O.Traversal<IState, any, A>,
    ) {
      return useBoundStore(O.preview(o));
    },
    collect: function <A>(
      o:
        | O.Prism<IState, any, A>
        | O.Traversal<IState, any, A>
        | O.Fold<IState, A>,
    ) {
      return useBoundStore(O.collect(o));
    },
    set: function <A>(
      o:
        | O.Lens<IState, any, A>
        | O.Iso<IState, any, A>
        | O.Prism<IState, any, A>
        | O.Traversal<IState, any, A>
        | O.Equivalence<IState, any, A>
        | O.Setter<IState, any, A>,
    ) {
      return useCallback(
        (value: A) => useBoundStore.setState(O.set(o)(value)),
        [o],
      );
    },
    setValue: function <A>(
      o:
        | O.Lens<IState, any, A>
        | O.Iso<IState, any, A>
        | O.Prism<IState, any, A>
        | O.Traversal<IState, any, A>
        | O.Equivalence<IState, any, A>
        | O.Setter<IState, any, A>,
      value: A,
    ) {
      return useCallback(
        () => useBoundStore.setState(O.set(o)(value)),
        [o, value],
      );
    },
    modify: function <A>(
      o:
        | O.Lens<IState, any, A>
        | O.Iso<IState, any, A>
        | O.Prism<IState, any, A>
        | O.Traversal<IState, any, A>
        | O.Equivalence<IState, any, A>,
      f: (a: A) => A,
    ) {
      return useCallback(() => useBoundStore.setState(O.modify(o)(f)), [o, f]);
    },
    modifyCb: function <A>(
      o:
        | O.Lens<IState, any, A>
        | O.Iso<IState, any, A>
        | O.Prism<IState, any, A>
        | O.Traversal<IState, any, A>
        | O.Equivalence<IState, any, A>,
    ) {
      return useCallback(
        (f: (a: A) => A) => useBoundStore.setState(O.modify(o)(f)),
        [o],
      );
    },
    remove: function <A>(
      o: O.Prism<IState, any, A> | O.Traversal<IState, any, A>,
    ) {
      return useCallback(() => useBoundStore.setState(O.remove(o)), [o]);
    },
    lens: function <A>(
      o:
        | O.Lens<IState, any, A>
        | O.Iso<IState, any, A>
        | O.Equivalence<IState, any, A>,
    ) {
      const value = useBoundStore(O.get(o));
      const setValue = useCallback(
        (value: A | undefined) => useBoundStore.setState(O.set(o)(value)),
        [o],
      );
      return [value, setValue] as const;
    },
    lensValue: function <A>(
      o:
        | O.Lens<IState, any, A>
        | O.Iso<IState, any, A>
        | O.Equivalence<IState, any, A>,
      value: A | undefined,
    ) {
      const value_ = useBoundStore(O.get(o));
      const setValue = useCallback(
        () => useBoundStore.setState(O.set(o)(value)),
        [o, value],
      );
      return [value_, setValue] as const;
    },
    lensActivate: function <A>(
      o:
        | O.Lens<IState, any, A>
        | O.Iso<IState, any, A>
        | O.Equivalence<IState, any, A>,
      value: A,
    ) {
      const value_ = useBoundStore(O.get(o));
      const setValue = useCallback(
        () => useBoundStore.setState(O.set(o)(value)),
        [o, value],
      );
      return [dequal(value, value_), setValue] as const;
    },
    toggle: function (
      o:
        | O.Lens<IState, any, boolean>
        | O.Iso<IState, any, boolean>
        | O.Equivalence<IState, any, boolean>,
    ) {
      const active = useBoundStore(O.get(o));
      const toggle = useCallback(
        () => useBoundStore.setState(O.modify(o)(neg)),
        [o],
      );
      return [active, toggle] as const;
    },
    lensModify: function <A>(
      o:
        | O.Lens<IState, any, A>
        | O.Iso<IState, any, A>
        | O.Equivalence<IState, any, A>,
      f: (a: A) => A,
    ) {
      const value_ = useBoundStore(O.get(o));
      const setValue = useCallback(
        () => useBoundStore.setState(O.modify(o)(f)),
        [f, o],
      );
      return [value_, setValue] as const;
    },
    opt: function <A>(
      o: O.Prism<IState, any, A> | O.Traversal<IState, any, A>,
    ) {
      const value = useBoundStore(O.preview(o));
      const setValue = useCallback(
        (value: A | undefined) => useBoundStore.setState(O.set(o)(value)),
        [o],
      );
      return [value, setValue] as const;
    },
    optValue: function <A>(
      o: O.Prism<IState, any, A> | O.Traversal<IState, any, A>,
      value: A | undefined,
    ) {
      const value_ = useBoundStore(O.preview(o));
      const setValue = useCallback(
        () => useBoundStore.setState(O.set(o)(value)),
        [o, value],
      );
      return [value_, setValue] as const;
    },
  };
}
