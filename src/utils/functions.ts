// https://blog.logrocket.com/how-to-create-compose-function-typescript
export const compose = <T>(fn1: (a: T) => T, ...fns: Array<(a: T) => T>) =>
  fns.reduce((prevFn, nextFn) => (value) => prevFn(nextFn(value)), fn1);

export const pipe = <T>(fn1: (a: T) => T, ...fns: Array<(a: T) => T>) =>
  fns.reduce((prevFn, nextFn) => (value) => nextFn(prevFn(value)), fn1);

export const identity = <T>(x: T) => x;
export const constant = <T>(x: T) => () => x;
