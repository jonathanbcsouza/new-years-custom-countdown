declare module 'chinese-lunar' {
  const chineseLunar: {
    solarToLunar(date: Date, format?: string): { year: number; month: number; day: number };
    lunarToSolar(year: number, month: number, day: number, leap?: boolean): Date;
  };
  export default chineseLunar;
}

declare module 'ethiopian-date' {
  export function toGregorian(
    date: [number, number, number] | number[]
  ): [number, number, number];
}

declare module 'hijri-js' {
  export function initialize(): {
    toHijri(date: string, splitter: string): unknown;
    toGregorian(date: string, splitter: string): string;
  };
}
