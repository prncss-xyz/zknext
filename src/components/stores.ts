/* eslint-disable react-hooks/rules-of-hooks */
import { useCallback } from "react";
import * as O from "optics-ts";
import { StoreApi, UseBoundStore } from "zustand";

export function createHooks<IState>(
  useBoundStore: UseBoundStore<StoreApi<IState>>
) {
  return {
    get: function <A>(
      o:
        | O.Lens<IState, any, A>
        | O.Iso<IState, any, A>
        | O.Equivalence<IState, any, A>
    ) {
      return useBoundStore(O.get(o));
    },
    preview: function <A>(
      o: O.Prism<IState, any, A> | O.Traversal<IState, any, A>
    ) {
      return useBoundStore(O.preview(o));
    },
    collect: function <A>(
      o:
        | O.Prism<IState, any, A>
        | O.Traversal<IState, any, A>
        | O.Fold<IState, A>
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
        | O.Setter<IState, any, A>
    ) {
      return useCallback(
        (value: A) => useBoundStore.setState(O.set(o)(value)),
        [o]
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
      value: A
    ) {
      return useCallback(
        () => useBoundStore.setState(O.set(o)(value)),
        [o, value]
      );
    },
    modify: function <A>(
      o:
        | O.Lens<IState, any, A>
        | O.Iso<IState, any, A>
        | O.Prism<IState, any, A>
        | O.Traversal<IState, any, A>
        | O.Equivalence<IState, any, A>,
      f: (a: A) => A
    ) {
      return useCallback(() => useBoundStore.setState(O.modify(o)(f)), [o, f]);
    },
    modifyCb: function <A>(
      o:
        | O.Lens<IState, any, A>
        | O.Iso<IState, any, A>
        | O.Prism<IState, any, A>
        | O.Traversal<IState, any, A>
        | O.Equivalence<IState, any, A>
    ) {
      return useCallback(
        (f: (a: A) => A) => useBoundStore.setState(O.modify(o)(f)),
        [o]
      );
    },
    remove: function <A>(
      o: O.Prism<IState, any, A> | O.Traversal<IState, any, A>
    ) {
      return useCallback(() => useBoundStore.setState(O.remove(o)), [o]);
    },

    lens: function <A>(
      o:
        | O.Lens<IState, any, A>
        | O.Iso<IState, any, A>
        | O.Equivalence<IState, any, A>
    ) {
      const value = useBoundStore(O.get(o));
      const setValue = useCallback(
        (value: A | undefined) => useBoundStore.setState(O.set(o)(value)),
        [o]
      );
      return [value, setValue] as const;
    },
    lensValue: function <A>(
      o:
        | O.Lens<IState, any, A>
        | O.Iso<IState, any, A>
        | O.Equivalence<IState, any, A>,
      value: A | undefined
    ) {
      const value_ = useBoundStore(O.get(o));
      const setValue = useCallback(
        () => useBoundStore.setState(O.set(o)(value)),
        [o, value]
      );
      return [value_, setValue] as const;
    },
    opt: function <A>(
      o: O.Prism<IState, any, A> | O.Traversal<IState, any, A>
    ) {
      const value = useBoundStore(O.preview(o));
      const setValue = useCallback(
        (value: A | undefined) => useBoundStore.setState(O.set(o)(value)),
        [o]
      );
      return [value, setValue] as const;
    },
    optValue: function <A>(
      o: O.Prism<IState, any, A> | O.Traversal<IState, any, A>,
      value: A | undefined
    ) {
      const value_ = useBoundStore(O.preview(o));
      const setValue = useCallback(
        () => useBoundStore.setState(O.set(o)(value)),
        [o, value]
      );
      return [value_, setValue] as const;
    },
  };
}
