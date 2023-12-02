export class Failure {
  readonly _tag = "failure";
  constructor(public message: string) {}
}

export class Success<T> {
  readonly _tag = "success";
  constructor(public result: T) {}
}

export function fromSuccess<T>(v: Errable<T>) {
  if (v._tag !== "success") throw new Error("expected success");
  return v.result
}

export function fromFailure<T>(v: Errable<T>) {
  if (v._tag !== "failure") throw new Error("expected failure");
  return v.message
}

export type Errable<T> = Success<T> | Failure;
