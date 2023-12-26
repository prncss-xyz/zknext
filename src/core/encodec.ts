export interface IEncodec<A> {
  encode: (v: A) => string;
  decode: (e: string) => A | undefined;
}

export class NumString implements IEncodec<number> {
  decode(str: string) {
    const num = Number(str);
    if (isNaN(num)) return undefined;
    return num;
  }

  encode(num: number): string {
    return String(num);
  }
}
