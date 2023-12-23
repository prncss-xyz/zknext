export function toggle<T>(xs: T[], x: T, value: boolean) {
  const xs_ = xs.filter((x_) => x_ !== x);
  if (value) {
    xs_.push(x);
  }
  xs_.sort();
  return xs_;
}
