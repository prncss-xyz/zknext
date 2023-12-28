"use client";
/* eslint-disable react-hooks/rules-of-hooks */

import * as O from "optics-ts";
import { Store } from "@tanstack/store";
import { useStore } from "@tanstack/react-store";
import { useCallback } from "react";

type Get<S, T extends O.OpticParams, A> =
  | O.Equivalence<S, T, A>
  | O.Iso<S, T, A>
  | O.Lens<S, T, A>
  | O.Getter<S, A>;

export class BoundedStore<S> {
  store: Store<S>;
  constructor(readonly init: S) {
    this.store = new Store(init);
  }
  get<T extends O.OpticParams, A>(optic: Get<S, T, A>) {
    const oGet = O.get as (optic: Get<S, T, A>) => (source: S) => A;
    return () => useStore(this.store, oGet(optic));
  }
  preview<T extends O.OpticParams, A>(
    optic:
      | O.Prism<S, T, A>
      | O.Traversal<S, T, A>
      | O.AffineFold<S, A>
      | O.Fold<S, A>,
  ) {
    return () => useStore(this.store, O.preview(optic));
  }
  collect<T extends O.OpticParams, A>(
    optic: O.Prism<S, T, A> | O.Traversal<S, T, A> | O.Fold<S, A>,
  ) {
    return () => useStore(this.store, O.collect(optic));
  }
  set<T extends O.OpticParams, A>(
    optic:
      | O.Equivalence<S, T, A>
      | O.Iso<S, T, A>
      | O.Lens<S, T, A>
      | O.Prism<S, T, A>
      | O.Traversal<S, T, A>
      | O.Setter<S, T, A>,
  ) {
    return (value: A) =>
      useCallback(() => this.store.setState(O.set(optic)(value)), [value]);
  }
  setC<T extends O.OpticParams, A>(
    optic:
      | O.Equivalence<S, T, A>
      | O.Iso<S, T, A>
      | O.Lens<S, T, A>
      | O.Prism<S, T, A>
      | O.Traversal<S, T, A>
      | O.Setter<S, T, A>,
  ) {
    return () =>
      useCallback((value: A) => this.store.setState(O.set(optic)(value)), []);
  }
  modify<T extends O.OpticParams, A>(
    optic:
      | O.Equivalence<S, T, A>
      | O.Iso<S, T, A>
      | O.Lens<S, T, A>
      | O.Prism<S, T, A>
      | O.Traversal<S, T, A>,
  ) {
    return (fn: (v: A) => A) =>
      useCallback(() => this.store.setState(O.modify(optic)(fn)), [fn]);
  }
  modifyC<T extends O.OpticParams, A>(
    optic:
      | O.Equivalence<S, T, A>
      | O.Iso<S, T, A>
      | O.Lens<S, T, A>
      | O.Prism<S, T, A>
      | O.Traversal<S, T, A>,
  ) {
    return () =>
      useCallback(
        (fn: (v: A) => A) => this.store.setState(O.modify(optic)(fn)),
        [],
      );
  }
  remove<T extends O.OpticParams, A>(
    optic: O.Prism<S, T, A> | O.Traversal<S, T, A>,
  ) {
    return () => useCallback(() => this.store.setState(O.remove(optic)), []);
  }
  rwLens<T extends O.OpticParams, A>(optic: O.Iso<S, T, A> | O.Lens<S, T, A>) {
    return (value: A) =>
      [
        useStore(this.store, O.get(optic)),
        useCallback(() => this.store.setState(O.set(optic)(value)), [value]),
      ] as const;
  }
  rwCLens<T extends O.OpticParams, A>(optic: O.Iso<S, T, A> | O.Lens<S, T, A>) {
    return () =>
      [
        useStore(this.store, O.get(optic)),
        useCallback((value: A) => this.store.setState(O.set(optic)(value)), []),
      ] as const;
  }

  lens<T extends O.OpticParams, A>(optic: O.Lens<S, T, A> | O.Iso<S, T, A>) {
    return {
      get: this.get(optic),
      set: this.set(optic),
      setC: this.setC(optic),
      modify: this.modify(optic),
      modifyC: this.modifyC(optic),
      rw: this.rwLens(optic),
      rwC: this.rwCLens(optic),
    };
  }
  prism<T extends O.OpticParams, A>(optic: O.Prism<S, T, A>) {
    return {
      preview: this.preview(optic),
      collect: this.collect(optic),
      set: this.set(optic),
      setC: this.setC(optic),
      modify: this.modify(optic),
      modifyC: this.modifyC(optic),
      remove: this.remove(optic),
    };
  }
  traversal<T extends O.OpticParams, A>(optic: O.Traversal<S, T, A>) {
    return {
      preview: this.preview(optic),
      collect: this.collect(optic),
      set: this.set(optic),
      setC: this.setC(optic),
      modify: this.modify(optic),
      modifyC: this.modifyC(optic),
      remove: this.remove(optic),
    };
  }
  affineFold<A>(optic: O.AffineFold<S, A>) {
    return {
      preview: this.preview(optic),
    };
  }
  fold<A>(optic: O.Fold<S, A>) {
    return {
      preview: this.preview(optic),
      collect: this.collect(optic),
    };
  }

  extract<R>(fn: (s: S) => R) {
    return {
      get: () => {
        return useStore(this.store, fn);
      },
    };
  }
  getter<R>(fn: (s: S) => R) {
    return {
      get: () => {
        return useStore(this.store, fn);
      },
    };
  }
  setter<A>(fn: (v: A) => (s: S) => S) {
    return {
      set: (value: A) => {
        return useCallback(() => this.store.setState(fn(value)), [value]);
      },
    };
  }
  setterC<A>(fn: (v: A) => (s: S) => S) {
    return {
      set: () => {
        return useCallback((value: A) => this.store.setState(fn(value)), []);
      },
    };
  }
  applied() {
    return {
      lens: this.lens.bind(this),
      prism: this.prism.bind(this),
      traversal: this.traversal.bind(this),
      affineFold: this.affineFold.bind(this),
      fold: this.fold.bind(this),
      setter: this.setter.bind(this),
    };
  }
}

/*
export function bindStore<S>(store: Store<S>) {
  function get<T extends O.OpticParams, A>(
    optic: Get<S, T, A>,
    store: Store<S>,
  ) {
    const oGet = O.get as (optic: Get<S, T, A>) => (source: S) => A;
    return () => useStore(store, oGet(optic));
  }
  function preview<T extends O.OpticParams, A>(
    optic:
      | O.Prism<S, T, A>
      | O.Traversal<S, T, A>
      | O.AffineFold<S, A>
      | O.Fold<S, A>,
    store: Store<S>,
  ) {
    return () => useStore(store, O.preview(optic));
  }
  function collect<T extends O.OpticParams, A>(
    optic: O.Prism<S, T, A> | O.Traversal<S, T, A> | O.Fold<S, A>,
    store: Store<S>,
  ) {
    return () => useStore(store, O.collect(optic));
  }
  function set<T extends O.OpticParams, A>(
    optic:
      | O.Equivalence<S, T, A>
      | O.Iso<S, T, A>
      | O.Lens<S, T, A>
      | O.Prism<S, T, A>
      | O.Traversal<S, T, A>
      | O.Setter<S, T, A>,
    store: Store<S>,
  ) {
    return (value: A) =>
      useCallback(() => store.setState(O.set(optic)(value)), [value]);
  }
  function setC<T extends O.OpticParams, A>(
    optic:
      | O.Equivalence<S, T, A>
      | O.Iso<S, T, A>
      | O.Lens<S, T, A>
      | O.Prism<S, T, A>
      | O.Traversal<S, T, A>
      | O.Setter<S, T, A>,
    store: Store<S>,
  ) {
    return () =>
      useCallback((value: A) => store.setState(O.set(optic)(value)), []);
  }
  function modify<T extends O.OpticParams, A>(
    optic:
      | O.Equivalence<S, T, A>
      | O.Iso<S, T, A>
      | O.Lens<S, T, A>
      | O.Prism<S, T, A>
      | O.Traversal<S, T, A>,
    store: Store<S>,
  ) {
    return (fn: (v: A) => A) =>
      useCallback(() => store.setState(O.modify(optic)(fn)), [fn]);
  }
  function modifyC<T extends O.OpticParams, A>(
    optic:
      | O.Equivalence<S, T, A>
      | O.Iso<S, T, A>
      | O.Lens<S, T, A>
      | O.Prism<S, T, A>
      | O.Traversal<S, T, A>,
    store: Store<S>,
  ) {
    return () =>
      useCallback((fn: (v: A) => A) => store.setState(O.modify(optic)(fn)), []);
  }
  function remove<T extends O.OpticParams, A>(
    optic: O.Prism<S, T, A> | O.Traversal<S, T, A>,
    store: Store<S>,
  ) {
    return () => useCallback(() => store.setState(O.remove(optic)), []);
  }
  function rwLens<T extends O.OpticParams, A>(
    optic: O.Iso<S, T, A> | O.Lens<S, T, A>,
    store: Store<S>,
  ) {
    return (value: A) =>
      [
        useStore(store, O.get(optic)),
        useCallback(() => store.setState(O.set(optic)(value)), [value]),
      ] as const;
  }
  function rwCLens<T extends O.OpticParams, A>(
    optic: O.Iso<S, T, A> | O.Lens<S, T, A>,
    store: Store<S>,
  ) {
    return () =>
      [
        useStore(store, O.get(optic)),
        useCallback((value: A) => store.setState(O.set(optic)(value)), []),
      ] as const;
  }

  function lens<T extends O.OpticParams, A>(
    optic: O.Lens<S, T, A> | O.Iso<S, T, A>,
  ) {
    return {
      get: get(optic, store),
      set: set(optic, store),
      setC: setC(optic, store),
      modify: modify(optic, store),
      modifyC: modifyC(optic, store),
      rw: rwLens(optic, store),
      rwC: rwCLens(optic, store),
    };
  }
  function prism<T extends O.OpticParams, A>(optic: O.Prism<S, T, A>) {
    return {
      preview: preview(optic, store),
      collect: collect(optic, store),
      set: set(optic, store),
      setC: setC(optic, store),
      modify: modify(optic, store),
      modifyC: modifyC(optic, store),
      remove: remove(optic, store),
    };
  }
  function traversal<T extends O.OpticParams, A>(optic: O.Traversal<S, T, A>) {
    return {
      preview: preview(optic, store),
      collect: collect(optic, store),
      set: set(optic, store),
      setC: setC(optic, store),
      modify: modify(optic, store),
      modifyC: modifyC(optic, store),
      remove: remove(optic, store),
    };
  }
  function affineFold<T extends O.OpticParams, A>(
    optic: O.AffineFold<S, T, A>,
  ) {
    return {
      preview: preview(optic, store),
      collect: collect(optic, store),
    };
  }
  function fold<T extends O.OpticParams, A>(optic: O.Fold<S, A>) {
    return {
      preview: preview(optic, store),
      collect: collect(optic, store),
    };
  }
  function setter<A>(fn: (v: A) => (s: S) => S) {
    return {
      set: (value: A) => {
        return useCallback(() => store.setState(fn(value)), [value]);
      },
    };
  }
  return { lens, prism, traversal, affineFold, fold, setter, getter };
}
*/
