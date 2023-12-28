export interface IEncodec<T, A> {
  encode: (decoded: T) => string;
  decode: (encoded: string) => T | undefined;
}

export class NumString implements IEncodec<number, string> {
  decode(str: string) {
    const num = Number(str);
    if (isNaN(num)) return undefined;
    return num;
  }

  encode(num: number): string {
    return String(num);
  }
}

function padTo2Digits(num: number) {
  return num.toString().padStart(2, "0");
}

export class DateString implements IEncodec<Date, string> {
  encode(date: Date) {
    return [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join("-");
  }

  decode(s: string) {
    let [y, m, d] = s.split(/\D/).map((s) => parseInt(s));
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }
}
