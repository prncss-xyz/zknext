class Encodec<T> {
  readonly encode: (decoded: T) => string;
  readonly decode: (encoded: string) => T | undefined;
  constructor(
    encode: (decoded: T) => string,
    decode: (encoded: string) => T | undefined,
  ) {
    this.encode = encode;
    this.decode = decode;
  }
}

export const numString = new Encodec(
  (num: number) => String(num),
  (str: string) => {
    const num = Number(str);
    if (isNaN(num)) return undefined;
    return num;
  },
);

function padTo2Digits(num: number) {
  return num.toString().padStart(2, "0");
}

export const dateString = new Encodec(
  (date: Date) =>
    [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join("-"),
  (s: string) => {
    let [y, m, d] = s.split(/\D/).map((s) => parseInt(s));
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  },
);
