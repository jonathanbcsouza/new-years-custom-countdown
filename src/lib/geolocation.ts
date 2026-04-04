/**
 * Geolocation utilities for timezone detection and holiday countdown calculations.
 * Now delegates to the generic holiday engine for date resolution.
 */

import {
  resolveNextHoliday,
  resolveUpcomingHolidays,
  getActiveHolidayForZone,
  getHolidayTargetInstant,
  getHolidayCelebrationEnd,
  type HolidayContext,
  type ResolvedHoliday,
} from './holidays';

const API_TIMEOUT_MS = 3000;
const GEOLOCATION_API_URL = 'https://ip-api.com/json/?fields=timezone';

export async function getUserTimezone(): Promise<string> {
  try {
    const response = await fetch(GEOLOCATION_API_URL, {
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const data = await response.json();
    if (data.timezone && typeof data.timezone === 'string') return data.timezone;
  } catch (error) {
    console.warn('IP geolocation failed, using browser timezone:', error);
  }
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (browserTimezone) return browserTimezone;
  return 'UTC';
}

export interface DateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function getDatePartsInTimezone(date: Date, timezone: string): DateParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((p) => p.type === type);
    return parseInt(part?.value ?? '0', 10);
  };
  return {
    year: getPart('year'),
    month: getPart('month'),
    day: getPart('day'),
    hour: getPart('hour'),
    minute: getPart('minute'),
    second: getPart('second'),
  };
}

export function findLocalMidnightUtc(
  y: number, m: number, d: number, timezone: string,
): Date | null {
  const base = Date.UTC(y, m - 1, d, 12, 0, 0);
  for (let h = -20; h <= 20; h++) {
    const cand = new Date(base + h * 3600 * 1000);
    const p = getDatePartsInTimezone(cand, timezone);
    if (p.year === y && p.month === m && p.day === d && p.hour === 0 && p.minute === 0) {
      return cand;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Holiday-engine-backed result type
// ---------------------------------------------------------------------------

export interface CelebrationResult {
  targetDate: Date;
  isCelebrationPeriod: boolean;
  celebrationEndDate: Date | null;
  holiday: ResolvedHoliday | null;
}

/**
 * Backward-compatible alias – kept so existing callers don't break.
 */
export type NewYearResult = CelebrationResult;

/**
 * Primary API: determines the next celebration date for a timezone + country.
 */
export function getNextCelebration(
  timezone: string,
  countryCode?: string,
): CelebrationResult {
  const now = new Date();
  const ctx: HolidayContext = { timezone, countryCode };

  const active = getActiveHolidayForZone(ctx, now);
  if (active) {
    const end = getHolidayCelebrationEnd(active, ctx);
    return {
      targetDate: end,
      isCelebrationPeriod: true,
      celebrationEndDate: end,
      holiday: active,
    };
  }

  const next = resolveNextHoliday(ctx, now);
  if (next) {
    const target = getHolidayTargetInstant(next, ctx);
    return {
      targetDate: target,
      isCelebrationPeriod: false,
      celebrationEndDate: null,
      holiday: next,
    };
  }

  const parts = getDatePartsInTimezone(now, timezone);
  const fallback = findLocalMidnightUtc(parts.year + 1, 1, 1, timezone);
  return {
    targetDate: fallback ?? new Date(Date.UTC(parts.year + 1, 0, 1)),
    isCelebrationPeriod: false,
    celebrationEndDate: null,
    holiday: null,
  };
}

/** @deprecated Use getNextCelebration instead. */
export function getNewYearDate(
  timezone: string,
  countryCode?: string,
): CelebrationResult {
  return getNextCelebration(timezone, countryCode);
}

/**
 * Check whether any holiday is currently being celebrated in a timezone.
 */
export function isCelebrationInTimezone(
  timezone: string,
  countryCode?: string,
): boolean {
  const now = new Date();
  const ctx: HolidayContext = { timezone, countryCode };
  return getActiveHolidayForZone(ctx, now) !== null;
}

/** @deprecated Use isCelebrationInTimezone instead. */
export function isNewYearInTimezone(
  timezone: string,
  countryCode?: string,
): boolean {
  return isCelebrationInTimezone(timezone, countryCode);
}

/**
 * Get the active holiday details for a timezone (if any).
 */
export function getActiveCelebration(
  timezone: string,
  countryCode?: string,
): ResolvedHoliday | null {
  const now = new Date();
  const ctx: HolidayContext = { timezone, countryCode };
  return getActiveHolidayForZone(ctx, now);
}

export interface SecondaryCelebration {
  holiday: ResolvedHoliday;
  targetDate: Date;
}

/**
 * Returns holidays within the next `windowDays` (default 7) after the primary,
 * excluding the primary itself.
 */
export function getUpcomingSecondary(
  timezone: string,
  countryCode?: string,
  windowDays = 7,
): SecondaryCelebration[] {
  const now = new Date();
  const ctx: HolidayContext = { timezone, countryCode };
  const upcoming = resolveUpcomingHolidays(ctx, now, 8);
  if (upcoming.length < 2) return [];

  const primary = upcoming[0]!;
  const primaryTarget = getHolidayTargetInstant(primary, ctx);
  const windowMs = windowDays * 24 * 3600_000;

  const results: SecondaryCelebration[] = [];
  for (let i = 1; i < upcoming.length; i++) {
    const h = upcoming[i]!;
    const target = getHolidayTargetInstant(h, ctx);
    if (target.getTime() - primaryTarget.getTime() <= windowMs) {
      results.push({ holiday: h, targetDate: target });
    }
  }
  return results;
}
