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
    const num = Number(str);
    if (isNaN(num)) return undefined;
    return num;
  },
);

function padTo2Digits(num: number) {
  return num.toString().padStart(2, "0");
}

export const dateString = new Encodec<Date>(
  (date) =>
    date === undefined
      ? ""
      : [
          date.getFullYear(),
          padTo2Digits(date.getMonth() + 1),
          padTo2Digits(date.getDate()),
        ].join("-"),
  (s) => {
    let [y, m, d] = s.split(/\-/).map((s) => parseInt(s));
    if (isNaN(y)) return undefined;
    if (isNaN(m)) return new Date(y, 0);
    if (isNaN(d)) return new Date(y, m - 1);
    return new Date(y, m - 1, d);
  },
);
