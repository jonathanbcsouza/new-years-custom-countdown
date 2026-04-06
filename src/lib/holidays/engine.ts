/**
 * Holiday engine: resolves the next upcoming holiday for a given context.
 */

import type {
  HolidayContext,
  HolidayDefinition,
  ResolvedHoliday,
  DateParts,
} from './types';
import { HOLIDAY_CATALOG } from './catalog';
import {
  getDateProvider,
  nthWeekdayOfMonth,
  lastWeekdayOfMonth,
  type YMD,
} from './dateProviders';
import { resolveObservedDate } from './observedDates';

// ---------------------------------------------------------------------------
// Date resolution: convert a HolidayDateRule into a concrete YMD for a year
// ---------------------------------------------------------------------------
function resolveRuleForYear(
  def: HolidayDefinition,
  year: number,
): YMD | null {
  const rule = def.rule;

  switch (rule.kind) {
    case 'fixed':
      return { year, month: rule.month, day: rule.day };

    case 'nth_weekday':
      return nthWeekdayOfMonth(year, rule.month, rule.dayOfWeek, rule.week);

    case 'last_weekday':
      return lastWeekdayOfMonth(year, rule.month, rule.dayOfWeek);

    case 'provider': {
      const provider = getDateProvider(rule.providerId);
      if (!provider) return null;
      return provider(year);
    }

    case 'table':
      return null;

    case 'range_start':
      return resolveRuleForYear({ ...def, rule: rule.innerRule }, year);
  }
}

// ---------------------------------------------------------------------------
// Market applicability
// ---------------------------------------------------------------------------
function isApplicable(def: HolidayDefinition, countryCode: string | undefined): boolean {
  if (def.markets === 'worldwide') return true;
  if (!countryCode) return false;
  if (Array.isArray(def.markets)) return def.markets.includes(countryCode);
  return false;
}

// ---------------------------------------------------------------------------
// YMD comparison helpers
// ---------------------------------------------------------------------------
function ymdToNum(d: YMD): number {
  return d.year * 10000 + d.month * 100 + d.day;
}

function ymdToDate(d: YMD): Date {
  return new Date(d.year, d.month - 1, d.day);
}

// ---------------------------------------------------------------------------
// Main API: resolve the next upcoming holiday
// ---------------------------------------------------------------------------

/**
 * Returns holidays applicable to the given context, sorted by date ascending,
 * that fall strictly after `today` (or include today if within celebration window).
 */
export function resolveUpcomingHolidays(
  context: HolidayContext,
  now: Date,
  limit = 5,
): ResolvedHoliday[] {
  const parts = getDatePartsFromDate(now, context.timezone);
  const todayNum = parts.year * 10000 + parts.month * 100 + parts.day;

  const candidates: { def: HolidayDefinition; date: YMD; dateNum: number }[] = [];

  for (const def of HOLIDAY_CATALOG) {
    if (!isApplicable(def, context.countryCode)) continue;

    for (const year of [parts.year, parts.year + 1]) {
      const date = resolveRuleForYear(def, year);
      if (!date) continue;
      const dateNum = ymdToNum(date);
      if (dateNum >= todayNum) {
        candidates.push({ def, date, dateNum });
        break;
      }
    }
  }

  candidates.sort((a, b) => {
    if (a.dateNum !== b.dateNum) return a.dateNum - b.dateNum;
    return b.def.priority - a.def.priority;
  });

  const seen = new Set<string>();
  const results: ResolvedHoliday[] = [];
  for (const c of candidates) {
    if (seen.has(c.def.id)) continue;
    seen.add(c.def.id);
    const observed = resolveObservedDate(c.def.id, c.date, context.countryCode);
    results.push({
      definition: c.def,
      date: c.date,
      ...(observed ? { observedDate: observed } : {}),
    });
    if (results.length >= limit) break;
  }

  return results;
}

/**
 * Returns the single next holiday to count down to.
 * Picks the one with highest priority if multiple share the same date.
 */
export function resolveNextHoliday(
  context: HolidayContext,
  now: Date,
): ResolvedHoliday | null {
  const upcoming = resolveUpcomingHolidays(context, now, 1);
  return upcoming[0] ?? null;
}

/**
 * Check if a specific holiday is within its celebration window right now.
 */
export function isHolidayActive(
  holiday: ResolvedHoliday,
  context: HolidayContext,
  now: Date,
): boolean {
  const parts = getDatePartsFromDate(now, context.timezone);
  const eventDate = ymdToDate(holiday.date);
  const nowDate = new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const diffMs = nowDate.getTime() - eventDate.getTime();
  if (diffMs < 0) return false;
  const windowMs = holiday.definition.windowHours * 3600_000;
  return diffMs < windowMs;
}

/**
 * Get the UTC instant for the target date at local midnight in the given timezone.
 */
export function getHolidayTargetInstant(
  holiday: ResolvedHoliday,
  context: HolidayContext,
): Date {
  const { year, month, day } = holiday.date;
  const base = Date.UTC(year, month - 1, day, 12, 0, 0);
  for (let h = -20; h <= 20; h++) {
    const cand = new Date(base + h * 3600 * 1000);
    const p = getDatePartsFromDate(cand, context.timezone);
    if (p.year === year && p.month === month && p.day === day && p.hour === 0 && p.minute === 0) {
      return cand;
    }
  }
  return new Date(base);
}

/**
 * Get the celebration-end UTC instant for an active holiday.
 */
export function getHolidayCelebrationEnd(
  holiday: ResolvedHoliday,
  context: HolidayContext,
): Date {
  const target = getHolidayTargetInstant(holiday, context);
  return new Date(target.getTime() + holiday.definition.windowHours * 3600_000);
}

// ---------------------------------------------------------------------------
// Convenience: check if ANY holiday is active for a zone
// ---------------------------------------------------------------------------
export function getActiveHolidayForZone(
  context: HolidayContext,
  now: Date,
): ResolvedHoliday | null {
  const parts = getDatePartsFromDate(now, context.timezone);
  const todayNum = parts.year * 10000 + parts.month * 100 + parts.day;

  let best: { holiday: ResolvedHoliday; priority: number } | null = null;

  for (const def of HOLIDAY_CATALOG) {
    if (!isApplicable(def, context.countryCode)) continue;

    for (const year of [parts.year - 1, parts.year, parts.year + 1]) {
      const date = resolveRuleForYear(def, year);
      if (!date) continue;
      const dateNum = ymdToNum(date);
      if (dateNum > todayNum) continue;

      const observed = resolveObservedDate(def.id, date, context.countryCode);
      const resolved: ResolvedHoliday = {
        definition: def,
        date,
        ...(observed ? { observedDate: observed } : {}),
      };
      if (isHolidayActive(resolved, context, now)) {
        if (!best || def.priority > best.priority) {
          best = { holiday: resolved, priority: def.priority };
        }
      }
    }
  }

  return best?.holiday ?? null;
}

// ---------------------------------------------------------------------------
// Full-catalog resolution for the holidays listing page
// ---------------------------------------------------------------------------

/**
 * Resolves every holiday in the catalog for the given year, sorted
 * chronologically. Optionally filter by country code; when undefined
 * all holidays are returned (global view).
 */
export function resolveAllHolidaysForYear(
  year: number,
  countryCode?: string,
): ResolvedHoliday[] {
  const results: ResolvedHoliday[] = [];

  for (const def of HOLIDAY_CATALOG) {
    if (countryCode && !isApplicable(def, countryCode)) continue;

    const date = resolveRuleForYear(def, year);
    if (!date) continue;

    const observed = resolveObservedDate(def.id, date, countryCode);
    results.push({
      definition: def,
      date,
      ...(observed ? { observedDate: observed } : {}),
    });
  }

  results.sort((a, b) => {
    const aNum = ymdToNum(a.date);
    const bNum = ymdToNum(b.date);
    if (aNum !== bNum) return aNum - bNum;
    return b.definition.priority - a.definition.priority;
  });

  return results;
}

// ---------------------------------------------------------------------------
// Internal date-parts extraction (reuses Intl API)
// ---------------------------------------------------------------------------
function getDatePartsFromDate(date: Date, timezone: string): DateParts {
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
