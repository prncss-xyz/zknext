import * as O from "optics-ts";

export function id<T>() {
  const id = (x: T) => x;
  return O.optic<T>().iso(id, id);
}

export function member<T>(x: T) {
  function update(xs: T[], value: boolean) {
    const xs_ = xs.filter((x_) => !Object.is(x_, x));
    if (value) {
      xs_.push(x);
    }
    xs_.sort();
    return xs_;
  }

  function view(xs: T[]) {
    return xs.includes(x);
  }

  return O.optic<T[]>().lens<boolean>(view, update);
}
