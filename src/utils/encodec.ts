export class Encodec<T> {
  readonly encode: (decoded: T | undefined) => string;
  readonly decode: (encoded: string) => T | undefined;
  constructor(
    encode: (decoded: T | undefined) => string,
    decode: (encoded: string) => T | undefined,
  ) {
    this.encode = encode;
    this.decode = decode;
  }
}

export const numberString = new Encodec<number>(
  (num) => (num === undefined ? "" : String(num)),
  (str) => {
    if (str === "") return undefined;
    const num = Number(str);
    if (isNaN(num)) return undefined;
    return num;
  },
);

function padTo2Digits(num: number) {
  return num.toString().padStart(2, "0");
}

export const dateString = new Encodec<number>(
  (num) => {
    if (num === undefined) return "";
    const date = new Date(num);
    return [
      date.getUTCFullYear(),
      padTo2Digits(date.getUTCMonth() + 1),
      padTo2Digits(date.getUTCDate()),
    ].join("-");
  },
  (s) => {
    const date = new Date(s);
    const num = date.getTime();
    if (isNaN(num)) return undefined;
    return num;
  },
);
