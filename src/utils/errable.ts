export function failure(message: string) {
  return {
    _tag: "failure" as const,
    message,
  };
}

export function success<T>(result: T) {
  return {
    _tag: "success" as const,
    result,
  };
}

export type Errable<T> =
  | ReturnType<typeof success<T>>
  | ReturnType<typeof failure>;

export function fromSuccess<T>(v: Errable<T>) {
  if (v._tag === "success") return v.result;
  throw new Error("expected success");
}

export function fromFailure<T>(v: Errable<T>) {
  if (v._tag === "failure") return v.message;
  throw new Error("expected failure");
}
