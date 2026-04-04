/**
 * Per-country cultural "New Year" for celebrations (not only Gregorian 1 Jan).
 */

import chineseLunar from 'chinese-lunar';
import { toGregorian as ethToGregorian } from 'ethiopian-date';
import { initialize as initHijri } from 'hijri-js';
import { HebrewCalendar } from '@hebcal/core';

export type CulturalNewYearRuleKind =
  | 'gregorian'
  | 'lunar_cny'
  | 'nowruz'
  | 'islamic_hijri'
  | 'ethiopian'
  | 'matariki'
  | 'songkran'
  | 'bengali_pohela'
  | 'jewish_rosh_hashanah';

export const COUNTRY_CULTURAL_NEW_YEAR: Partial<
  Record<string, CulturalNewYearRuleKind>
> = {
  CN: 'lunar_cny',
  HK: 'lunar_cny',
  MO: 'lunar_cny',
  TW: 'lunar_cny',
  KR: 'lunar_cny',
  VN: 'lunar_cny',
  SG: 'lunar_cny',
  MN: 'lunar_cny',

  IR: 'nowruz',
  AF: 'nowruz',
  AZ: 'nowruz',
  KZ: 'nowruz',
  KG: 'nowruz',
  TJ: 'nowruz',
  TM: 'nowruz',
  UZ: 'nowruz',

  SA: 'islamic_hijri',
  AE: 'islamic_hijri',
  OM: 'islamic_hijri',
  QA: 'islamic_hijri',
  BH: 'islamic_hijri',
  KW: 'islamic_hijri',
  YE: 'islamic_hijri',

  ET: 'ethiopian',
  NZ: 'matariki',

  TH: 'songkran',
  LA: 'songkran',
  KH: 'songkran',
  MM: 'songkran',

  BD: 'bengali_pohela',
  IL: 'jewish_rosh_hashanah',
};

const NOWruz_MD: Partial<Record<number, { m: number; d: number }>> = {
  2024: { m: 3, d: 20 },
  2025: { m: 3, d: 20 },
  2026: { m: 3, d: 20 },
  2027: { m: 3, d: 21 },
  2028: { m: 3, d: 20 },
  2029: { m: 3, d: 20 },
  2030: { m: 3, d: 20 },
  2031: { m: 3, d: 21 },
  2032: { m: 3, d: 20 },
  2033: { m: 3, d: 20 },
  2034: { m: 3, d: 20 },
  2035: { m: 3, d: 21 },
  2036: { m: 3, d: 20 },
  2037: { m: 3, d: 20 },
  2038: { m: 3, d: 20 },
};

const MATARIKI_MD: Partial<Record<number, { m: number; d: number }>> = {
  2024: { m: 6, d: 28 },
  2025: { m: 6, d: 20 },
  2026: { m: 7, d: 10 },
  2027: { m: 6, d: 25 },
  2028: { m: 7, d: 14 },
  2029: { m: 7, d: 6 },
  2030: { m: 6, d: 21 },
  2031: { m: 7, d: 11 },
  2032: { m: 7, d: 2 },
  2033: { m: 6, d: 24 },
  2034: { m: 7, d: 13 },
  2035: { m: 7, d: 3 },
};

export interface DateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function getRuleForCountry(
  countryCode: string | undefined
): CulturalNewYearRuleKind {
  if (!countryCode) return 'gregorian';
  return COUNTRY_CULTURAL_NEW_YEAR[countryCode] ?? 'gregorian';
}

const hijriApi = initHijri();

function hijriMuharram1Parts(hYear: number): { y: number; m: number; d: number } {
  const iso = hijriApi.toGregorian(`1-1-${hYear}`, '-');
  const u = new Date(iso);
  return { y: u.getUTCFullYear(), m: u.getUTCMonth() + 1, d: u.getUTCDate() };
}

function lunarNewYearParts(lunarYear: number): { y: number; m: number; d: number } {
  const d = chineseLunar.lunarToSolar(lunarYear, 1, 1);
  return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
}

function marchProbeLunarYear(gregorianLocalYear: number): number {
  return chineseLunar.solarToLunar(new Date(gregorianLocalYear, 2, 1)).year;
}

/** Enkutatash (Meskerem 1) that falls in the given Gregorian year. */
function ethiopianNewYearInGregorianYear(gregorianY: number): {
  y: number;
  m: number;
  d: number;
} {
  const [y, m, d] = ethToGregorian([gregorianY - 7, 1, 1]) as [number, number, number];
  return { y, m, d };
}

function roshHashanahFullYmd(
  gregorianYear: number,
  isIsrael = true
): { y: number; m: number; d: number }[] {
  const evs = HebrewCalendar.calendar({ year: gregorianYear, il: isIsrael });
  const days: { y: number; m: number; d: number }[] = [];
  for (const e of evs) {
    const desc = e.getDesc();
    if (
      (desc.startsWith('Rosh Hashana ') &&
        !desc.includes('LaBehemot') &&
        desc !== 'Rosh Hashana II') ||
      desc === 'Rosh Hashana II'
    ) {
      const gd = e.getDate().greg();
      days.push({
        y: gd.getFullYear(),
        m: gd.getMonth() + 1,
        d: gd.getDate(),
      });
    }
  }
  return days;
}

/** Strictly after local calendar (y, m, d), ignoring time-of-day. */
function isYmdAfter(
  y: number,
  m: number,
  d: number,
  fy: number,
  fm: number,
  fd: number
): boolean {
  return fy > y || (fy === y && (fm > m || (fm === m && fd > d)));
}

/** Match existing Gregorian NY UI: primary festival day + spill into next civil morning. */
export function isStandardCelebrationWindow(
  parts: DateParts,
  festMonth: number,
  festDay: number
): boolean {
  const { month, day, hour, minute, second } = parts;
  if (month === festMonth && day === festDay) {
    const hoursSinceMidnight = hour + minute / 60 + second / 3600;
    return hoursSinceMidnight < 24;
  }
  if (month === festMonth && day === festDay + 1) {
    const hoursSinceMidnight = hour + minute / 60 + second / 3600;
    return hoursSinceMidnight < 24;
  }
  return false;
}

function isSongkran(parts: DateParts): boolean {
  if (parts.month !== 4) return false;
  if (parts.day >= 13 && parts.day <= 15) return true;
  if (parts.day === 16) {
    const h = parts.hour + parts.minute / 60 + parts.second / 3600;
    return h < 12;
  }
  return false;
}

function isBengaliPohela(parts: DateParts): boolean {
  if (parts.month !== 4) return false;
  if (parts.day === 14) return true;
  if (parts.day === 15) {
    const h = parts.hour + parts.minute / 60 + parts.second / 3600;
    return h < 12;
  }
  return false;
}

export function isCulturalNewYearCelebration(
  parts: DateParts,
  countryCode: string | undefined
): boolean {
  const rule = getRuleForCountry(countryCode);
  const y = parts.year;

  switch (rule) {
    case 'gregorian':
      return isStandardCelebrationWindow(parts, 1, 1);

    case 'lunar_cny': {
      const ly = marchProbeLunarYear(y);
      for (const dLy of [ly - 1, ly, ly + 1]) {
        try {
          const p = lunarNewYearParts(dLy);
          if (isStandardCelebrationWindow(parts, p.m, p.d)) return true;
        } catch {
          /* skip */
        }
      }
      return false;
    }

    case 'nowruz': {
      for (const gy of [y - 1, y, y + 1]) {
        const md = NOWruz_MD[gy] ?? { m: 3, d: 21 };
        if (isStandardCelebrationWindow(parts, md.m, md.d)) return true;
      }
      return false;
    }

    case 'islamic_hijri': {
      const hProbe = hijriApi.toHijri(`15/06/${y}`, '/') as {
        year: string | number;
      };
      const hy = parseInt(String(hProbe.year), 10);
      for (const h of [hy - 1, hy, hy + 1]) {
        const p = hijriMuharram1Parts(h);
        if (isStandardCelebrationWindow(parts, p.m, p.d)) return true;
      }
      return false;
    }

    case 'ethiopian': {
      for (const gy of [y - 1, y, y + 1]) {
        const p = ethiopianNewYearInGregorianYear(gy);
        if (isStandardCelebrationWindow(parts, p.m, p.d)) return true;
      }
      return false;
    }

    case 'matariki': {
      for (const gy of [y - 1, y, y + 1]) {
        const md = MATARIKI_MD[gy];
        if (md && isStandardCelebrationWindow(parts, md.m, md.d)) return true;
      }
      return false;
    }

    case 'songkran':
      return isSongkran(parts);

    case 'bengali_pohela':
      return isBengaliPohela(parts);

    case 'jewish_rosh_hashanah': {
      for (const gy of [y - 1, y, y + 1]) {
        for (const fd of roshHashanahFullYmd(gy)) {
          if (isStandardCelebrationWindow(parts, fd.m, fd.d)) return true;
        }
      }
      return false;
    }

    default:
      return false;
  }
}

export function getNextCulturalFestivalYmd(
  parts: DateParts,
  countryCode: string | undefined
): { year: number; month: number; day: number } {
  const rule = getRuleForCountry(countryCode);
  const y = parts.year;
  const m = parts.month;
  const d = parts.day;

  switch (rule) {
    case 'gregorian':
      return { year: y + 1, month: 1, day: 1 };

    case 'lunar_cny': {
      const ly = marchProbeLunarYear(y);
      const candidates: { y: number; m: number; d: number }[] = [];
      for (const delta of [-1, 0, 1, 2, 3]) {
        try {
          candidates.push(lunarNewYearParts(ly + delta));
        } catch {
          /* skip */
        }
      }
      candidates.sort((a, b) =>
        a.y !== b.y ? a.y - b.y : a.m !== b.m ? a.m - b.m : a.d - b.d
      );
      for (const c of candidates) {
        if (isYmdAfter(y, m, d, c.y, c.m, c.d))
          return { year: c.y, month: c.m, day: c.d };
      }
      const last = candidates[candidates.length - 1]!;
      const nextLy = marchProbeLunarYear(last.y + 1);
      const next = lunarNewYearParts(nextLy + 1);
      return { year: next.y, month: next.m, day: next.d };
    }

    case 'nowruz': {
      for (const gy of [y, y + 1, y + 2]) {
        const md = NOWruz_MD[gy] ?? { m: 3, d: 21 };
        if (isYmdAfter(y, m, d, gy, md.m, md.d))
          return { year: gy, month: md.m, day: md.d };
      }
      return { year: y + 1, month: 3, day: 21 };
    }

    case 'islamic_hijri': {
      const hProbe = hijriApi.toHijri(`15/06/${y}`, '/') as {
        year: string | number;
      };
      const hy = parseInt(String(hProbe.year), 10);
      for (let i = 0; i < 6; i++) {
        const p = hijriMuharram1Parts(hy + i);
        if (isYmdAfter(y, m, d, p.y, p.m, p.d))
          return { year: p.y, month: p.m, day: p.d };
      }
      const p = hijriMuharram1Parts(hy + 6);
      return { year: p.y, month: p.m, day: p.d };
    }

    case 'ethiopian': {
      for (const gy of [y, y + 1, y + 2]) {
        const p = ethiopianNewYearInGregorianYear(gy);
        if (isYmdAfter(y, m, d, p.y, p.m, p.d))
          return { year: p.y, month: p.m, day: p.d };
      }
      const p2 = ethiopianNewYearInGregorianYear(y + 3);
      return { year: p2.y, month: p2.m, day: p2.d };
    }

    case 'matariki': {
      for (const gy of [y, y + 1, y + 2]) {
        const md = MATARIKI_MD[gy];
        if (md && isYmdAfter(y, m, d, gy, md.m, md.d))
          return { year: gy, month: md.m, day: md.d };
      }
      return { year: y + 1, month: 6, day: 20 };
    }

    case 'songkran': {
      if (m < 4 || (m === 4 && d < 13))
        return { year: y, month: 4, day: 13 };
      return { year: y + 1, month: 4, day: 13 };
    }

    case 'bengali_pohela': {
      if (m < 4 || (m === 4 && d < 14))
        return { year: y, month: 4, day: 14 };
      return { year: y + 1, month: 4, day: 14 };
    }

    case 'jewish_rosh_hashanah': {
      const pool: { y: number; m: number; d: number }[] = [];
      for (const gy of [y - 1, y, y + 1, y + 2]) {
        pool.push(...roshHashanahFullYmd(gy));
      }
      pool.sort((a, b) =>
        a.y !== b.y ? a.y - b.y : a.m !== b.m ? a.m - b.m : a.d - b.d
      );
      for (const fd of pool) {
        if (isYmdAfter(y, m, d, fd.y, fd.m, fd.d))
          return { year: fd.y, month: fd.m, day: fd.d };
      }
      return { year: y + 1, month: 9, day: 1 };
    }

    default:
      return { year: y + 1, month: 1, day: 1 };
  }
}
