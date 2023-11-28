export class Failure {
  readonly _tag = "failure";
  constructor(public message: string) {}
}

export class Success<T> {
  readonly _tag = "success";
  constructor(public result: T) {}
}

export type Errable<T> = Success<T> | Failure;
