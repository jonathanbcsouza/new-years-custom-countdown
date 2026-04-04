/**
 * Date providers for holidays with non-fixed-date rules.
 * Reuses existing calendar libraries where available; falls back to
 * pre-computed lookup tables for complex astronomical calendars.
 */

import chineseLunar from 'chinese-lunar';
import { toGregorian as ethToGregorian } from 'ethiopian-date';
import { initialize as initHijri } from 'hijri-js';
import { HebrewCalendar } from '@hebcal/core';

const hijriApi = initHijri();

export interface YMD {
  year: number;
  month: number;
  day: number;
}

// ---------------------------------------------------------------------------
// Easter (Western) – Anonymous Gregorian algorithm (Computus)
// ---------------------------------------------------------------------------
export function easterDate(year: number): YMD {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { year, month, day };
}

export function goodFridayDate(year: number): YMD {
  const e = easterDate(year);
  const d = new Date(e.year, e.month - 1, e.day);
  d.setDate(d.getDate() - 2);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

export function mardiGrasDate(year: number): YMD {
  const e = easterDate(year);
  const d = new Date(e.year, e.month - 1, e.day);
  d.setDate(d.getDate() - 47);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

export function corpusChristiDate(year: number): YMD {
  const e = easterDate(year);
  const d = new Date(e.year, e.month - 1, e.day);
  d.setDate(d.getDate() + 60);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

// ---------------------------------------------------------------------------
// Chinese / Lunar New Year
// ---------------------------------------------------------------------------
export function lunarNewYearDate(year: number): YMD | null {
  try {
    const lunarYear = chineseLunar.solarToLunar(new Date(year, 2, 1)).year;
    const d = chineseLunar.lunarToSolar(lunarYear, 1, 1);
    if (d.getFullYear() === year) return { year, month: d.getMonth() + 1, day: d.getDate() };
    const d2 = chineseLunar.lunarToSolar(lunarYear + 1, 1, 1);
    if (d2.getFullYear() === year) return { year, month: d2.getMonth() + 1, day: d2.getDate() };
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Islamic dates via hijri-js
// ---------------------------------------------------------------------------
function hijriToGregorian(hYear: number, hMonth: number, hDay: number): YMD {
  const iso = hijriApi.toGregorian(`${hDay}-${hMonth}-${hYear}`, '-');
  const u = new Date(iso);
  return { year: u.getUTCFullYear(), month: u.getUTCMonth() + 1, day: u.getUTCDate() };
}

export function islamicNewYearDate(year: number): YMD | null {
  const hProbe = hijriApi.toHijri(`15/06/${year}`, '/') as { year: string | number };
  const hy = parseInt(String(hProbe.year), 10);
  for (let i = -1; i <= 2; i++) {
    const d = hijriToGregorian(hy + i, 1, 1);
    if (d.year === year) return d;
  }
  return null;
}

export function ramadanStartDate(year: number): YMD | null {
  const hProbe = hijriApi.toHijri(`15/01/${year}`, '/') as { year: string | number };
  const hy = parseInt(String(hProbe.year), 10);
  for (let i = -1; i <= 2; i++) {
    const d = hijriToGregorian(hy + i, 9, 1);
    if (d.year === year) return d;
  }
  return null;
}

export function eidAlFitrDate(year: number): YMD | null {
  const hProbe = hijriApi.toHijri(`15/06/${year}`, '/') as { year: string | number };
  const hy = parseInt(String(hProbe.year), 10);
  for (let i = -1; i <= 2; i++) {
    const d = hijriToGregorian(hy + i, 10, 1);
    if (d.year === year) return d;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Hebrew calendar dates via @hebcal/core
// ---------------------------------------------------------------------------
function findHebrewEvent(year: number, desc: string): YMD | null {
  try {
    const evs = HebrewCalendar.calendar({ year, il: false });
    for (const e of evs) {
      if (e.getDesc() === desc) {
        const g = e.getDate().greg();
        return { year: g.getFullYear(), month: g.getMonth() + 1, day: g.getDate() };
      }
    }
  } catch { /* noop */ }
  return null;
}

export function roshHashanahDate(year: number): YMD | null {
  return findHebrewEvent(year, 'Rosh Hashana 5787') ?? findHebrewEvent(year, 'Rosh Hashana');
}

export function hanukkahStartDate(year: number): YMD | null {
  const evs = HebrewCalendar.calendar({ year, il: false });
  for (const e of evs) {
    if (e.getDesc() === 'Chanukah: 1 Candle') {
      const g = e.getDate().greg();
      return { year: g.getFullYear(), month: g.getMonth() + 1, day: g.getDate() };
    }
  }
  return null;
}

export function passoverDate(year: number): YMD | null {
  return findHebrewEvent(year, 'Pesach I');
}

// ---------------------------------------------------------------------------
// Ethiopian New Year (Enkutatash)
// ---------------------------------------------------------------------------
export function ethiopianNewYearDate(year: number): YMD {
  const ethYear = year - 7;
  const [gy, gm, gd] = ethToGregorian([ethYear, 1, 1]) as [number, number, number];
  return { year: gy, month: gm, day: gd };
}

// ---------------------------------------------------------------------------
// Lookup-table-based providers for complex calendars
// ---------------------------------------------------------------------------

const NOWRUZ_TABLE: Record<number, YMD> = {};
for (const [y, md] of Object.entries({
  2024: [3, 20], 2025: [3, 20], 2026: [3, 20], 2027: [3, 21], 2028: [3, 20],
  2029: [3, 20], 2030: [3, 20], 2031: [3, 21], 2032: [3, 20], 2033: [3, 20],
  2034: [3, 20], 2035: [3, 21], 2036: [3, 20], 2037: [3, 20], 2038: [3, 20],
})) {
  NOWRUZ_TABLE[Number(y)] = { year: Number(y), month: (md as number[])[0]!, day: (md as number[])[1]! };
}

export function nowruzDate(year: number): YMD {
  return NOWRUZ_TABLE[year] ?? { year, month: 3, day: 20 };
}

const MATARIKI_TABLE: Record<number, YMD> = {};
for (const [y, md] of Object.entries({
  2024: [6, 28], 2025: [6, 20], 2026: [7, 10], 2027: [6, 25], 2028: [7, 14],
  2029: [7, 6], 2030: [6, 21], 2031: [7, 11], 2032: [7, 2], 2033: [6, 24],
  2034: [7, 13], 2035: [7, 3],
})) {
  MATARIKI_TABLE[Number(y)] = { year: Number(y), month: (md as number[])[0]!, day: (md as number[])[1]! };
}

export function matarikiDate(year: number): YMD | null {
  return MATARIKI_TABLE[year] ?? null;
}

const DIWALI_TABLE: Record<number, YMD> = {
  2024: { year: 2024, month: 11, day: 1 },
  2025: { year: 2025, month: 10, day: 20 },
  2026: { year: 2026, month: 11, day: 8 },
  2027: { year: 2027, month: 10, day: 29 },
  2028: { year: 2028, month: 10, day: 17 },
  2029: { year: 2029, month: 11, day: 5 },
  2030: { year: 2030, month: 10, day: 26 },
  2031: { year: 2031, month: 10, day: 16 },
  2032: { year: 2032, month: 11, day: 2 },
  2033: { year: 2033, month: 10, day: 23 },
  2034: { year: 2034, month: 11, day: 10 },
  2035: { year: 2035, month: 10, day: 31 },
};

export function diwaliDate(year: number): YMD | null {
  return DIWALI_TABLE[year] ?? null;
}

const HOLI_TABLE: Record<number, YMD> = {
  2024: { year: 2024, month: 3, day: 25 },
  2025: { year: 2025, month: 3, day: 14 },
  2026: { year: 2026, month: 3, day: 4 },
  2027: { year: 2027, month: 3, day: 22 },
  2028: { year: 2028, month: 3, day: 11 },
  2029: { year: 2029, month: 3, day: 1 },
  2030: { year: 2030, month: 3, day: 20 },
  2031: { year: 2031, month: 3, day: 10 },
  2032: { year: 2032, month: 2, day: 27 },
  2033: { year: 2033, month: 3, day: 16 },
  2034: { year: 2034, month: 3, day: 6 },
  2035: { year: 2035, month: 3, day: 25 },
};

export function holiDate(year: number): YMD | null {
  return HOLI_TABLE[year] ?? null;
}

const CHUSEOK_TABLE: Record<number, YMD> = {
  2024: { year: 2024, month: 9, day: 17 },
  2025: { year: 2025, month: 10, day: 6 },
  2026: { year: 2026, month: 9, day: 25 },
  2027: { year: 2027, month: 9, day: 15 },
  2028: { year: 2028, month: 10, day: 3 },
  2029: { year: 2029, month: 9, day: 22 },
  2030: { year: 2030, month: 9, day: 12 },
  2031: { year: 2031, month: 10, day: 1 },
  2032: { year: 2032, month: 9, day: 19 },
  2033: { year: 2033, month: 9, day: 8 },
  2034: { year: 2034, month: 9, day: 27 },
  2035: { year: 2035, month: 9, day: 16 },
};

export function chuseokDate(year: number): YMD | null {
  return CHUSEOK_TABLE[year] ?? null;
}

const MID_AUTUMN_TABLE: Record<number, YMD> = {
  2024: { year: 2024, month: 9, day: 17 },
  2025: { year: 2025, month: 10, day: 6 },
  2026: { year: 2026, month: 9, day: 25 },
  2027: { year: 2027, month: 9, day: 15 },
  2028: { year: 2028, month: 10, day: 3 },
  2029: { year: 2029, month: 9, day: 22 },
  2030: { year: 2030, month: 9, day: 12 },
  2031: { year: 2031, month: 10, day: 1 },
  2032: { year: 2032, month: 9, day: 19 },
  2033: { year: 2033, month: 9, day: 8 },
  2034: { year: 2034, month: 9, day: 27 },
  2035: { year: 2035, month: 9, day: 16 },
};

export function midAutumnDate(year: number): YMD | null {
  return MID_AUTUMN_TABLE[year] ?? null;
}

const DRAGON_BOAT_TABLE: Record<number, YMD> = {
  2024: { year: 2024, month: 6, day: 10 },
  2025: { year: 2025, month: 5, day: 31 },
  2026: { year: 2026, month: 6, day: 19 },
  2027: { year: 2027, month: 6, day: 9 },
  2028: { year: 2028, month: 5, day: 28 },
  2029: { year: 2029, month: 6, day: 16 },
  2030: { year: 2030, month: 6, day: 5 },
  2031: { year: 2031, month: 6, day: 24 },
  2032: { year: 2032, month: 6, day: 13 },
  2033: { year: 2033, month: 6, day: 3 },
  2034: { year: 2034, month: 6, day: 22 },
  2035: { year: 2035, month: 6, day: 11 },
};

export function dragonBoatDate(year: number): YMD | null {
  return DRAGON_BOAT_TABLE[year] ?? null;
}

const VESAK_TABLE: Record<number, YMD> = {
  2024: { year: 2024, month: 5, day: 22 },
  2025: { year: 2025, month: 5, day: 12 },
  2026: { year: 2026, month: 5, day: 1 },
  2027: { year: 2027, month: 5, day: 20 },
  2028: { year: 2028, month: 5, day: 9 },
  2029: { year: 2029, month: 5, day: 27 },
  2030: { year: 2030, month: 5, day: 17 },
  2031: { year: 2031, month: 5, day: 7 },
  2032: { year: 2032, month: 5, day: 24 },
  2033: { year: 2033, month: 5, day: 14 },
  2034: { year: 2034, month: 5, day: 3 },
  2035: { year: 2035, month: 5, day: 22 },
};

export function vesakDate(year: number): YMD | null {
  return VESAK_TABLE[year] ?? null;
}

const OKTOBERFEST_START_TABLE: Record<number, YMD> = {
  2024: { year: 2024, month: 9, day: 21 },
  2025: { year: 2025, month: 9, day: 20 },
  2026: { year: 2026, month: 9, day: 19 },
  2027: { year: 2027, month: 9, day: 18 },
  2028: { year: 2028, month: 9, day: 16 },
  2029: { year: 2029, month: 9, day: 22 },
  2030: { year: 2030, month: 9, day: 21 },
  2031: { year: 2031, month: 9, day: 20 },
  2032: { year: 2032, month: 9, day: 18 },
  2033: { year: 2033, month: 9, day: 17 },
  2034: { year: 2034, month: 9, day: 16 },
  2035: { year: 2035, month: 9, day: 22 },
};

export function oktoberfestStartDate(year: number): YMD | null {
  return OKTOBERFEST_START_TABLE[year] ?? null;
}

// ---------------------------------------------------------------------------
// Nth weekday helper
// ---------------------------------------------------------------------------
export function nthWeekdayOfMonth(
  year: number,
  month: number,
  dayOfWeek: number,
  week: number,
): YMD {
  const first = new Date(year, month - 1, 1);
  const dow = first.getDay();
  let day = 1 + ((dayOfWeek - dow + 7) % 7) + (week - 1) * 7;
  const maxDays = new Date(year, month, 0).getDate();
  if (day > maxDays) day -= 7;
  return { year, month, day };
}

export function lastWeekdayOfMonth(
  year: number,
  month: number,
  dayOfWeek: number,
): YMD {
  const lastDay = new Date(year, month, 0);
  const diff = (lastDay.getDay() - dayOfWeek + 7) % 7;
  const day = lastDay.getDate() - diff;
  return { year, month, day };
}

// ---------------------------------------------------------------------------
// Provider registry: maps providerId → resolver(year)
// ---------------------------------------------------------------------------
export type DateProvider = (year: number) => YMD | null;

const providers: Record<string, DateProvider> = {
  easter: easterDate,
  good_friday: goodFridayDate,
  mardi_gras: mardiGrasDate,
  corpus_christi: corpusChristiDate,
  lunar_new_year: lunarNewYearDate,
  islamic_new_year: islamicNewYearDate,
  ramadan_start: ramadanStartDate,
  eid_al_fitr: eidAlFitrDate,
  hanukkah: hanukkahStartDate,
  passover: passoverDate,
  ethiopian_new_year: ethiopianNewYearDate,
  nowruz: nowruzDate,
  matariki: matarikiDate,
  diwali: diwaliDate,
  holi: holiDate,
  chuseok: chuseokDate,
  mid_autumn: midAutumnDate,
  dragon_boat: dragonBoatDate,
  vesak: vesakDate,
  oktoberfest: oktoberfestStartDate,
};

export function getDateProvider(id: string): DateProvider | undefined {
  return providers[id];
}
