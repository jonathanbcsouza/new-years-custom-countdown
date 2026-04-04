/**
 * Observed / substitute public holiday date resolution.
 *
 * Many countries shift public holidays when they fall on weekends.
 * This module maps (holidayId, countryCode) -> shift strategy and
 * resolves the actual observed date at runtime.
 *
 * The cultural date remains the countdown target; the observed date
 * is shown as an informational note in the UI.
 */

import type { YMD } from './dateProviders';

// ---------------------------------------------------------------------------
// Shift strategies
// ---------------------------------------------------------------------------

interface FixedOffsetShift {
  kind: 'fixed_offset';
  days: number;
}

interface NextMondayShift {
  kind: 'next_monday';
}

interface NearestWeekdayShift {
  kind: 'nearest_weekday';
}

type ObservedDateShift = FixedOffsetShift | NextMondayShift | NearestWeekdayShift;

// ---------------------------------------------------------------------------
// Rules map — keyed by "holidayId:countryCode" or "holidayId:*" for wildcard
// ---------------------------------------------------------------------------

const OBSERVED_RULES = new Map<string, ObservedDateShift>();

function addRule(holidayId: string, countries: string[], shift: ObservedDateShift) {
  for (const cc of countries) {
    OBSERVED_RULES.set(`${holidayId}:${cc}`, shift);
  }
}

// Easter → Easter Monday (+1) in many countries
addRule('easter', [
  'NZ', 'AU', 'GB', 'IE', 'DE', 'FR', 'IT', 'NL', 'BE', 'AT', 'CH',
  'PL', 'CZ', 'HU', 'NO', 'DK', 'FI', 'SE', 'HR', 'SK', 'SI', 'LT',
  'LV', 'EE', 'PT', 'ES', 'GR', 'CY', 'MT', 'LU', 'RO', 'BG', 'ZA',
], { kind: 'fixed_offset', days: 1 });

// Christmas — weekend shift
addRule('christmas', ['US'], { kind: 'nearest_weekday' });
addRule('christmas', ['GB', 'NZ', 'AU', 'CA'], { kind: 'next_monday' });

// Boxing Day — weekend shift
addRule('boxing_day', ['GB', 'NZ', 'AU', 'CA'], { kind: 'next_monday' });

// New Year's Day — weekend shift
addRule('new_years_day', ['GB', 'NZ', 'AU'], { kind: 'next_monday' });
addRule('new_years_day', ['US'], { kind: 'nearest_weekday' });

// US Independence Day — nearest weekday
addRule('independence_day_us', ['US'], { kind: 'nearest_weekday' });

// Canada Day — next Monday if weekend
addRule('canada_day', ['CA'], { kind: 'next_monday' });

// NZ Mondayisation
addRule('waitangi_day', ['NZ'], { kind: 'next_monday' });
addRule('anzac_day', ['NZ'], { kind: 'next_monday' });
addRule('day_after_new_years_day', ['NZ'], { kind: 'next_monday' });

// Australia Day — next Monday if weekend
addRule('australia_day', ['AU'], { kind: 'next_monday' });

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------

function ymdToDayOfWeek(d: YMD): number {
  return new Date(d.year, d.month - 1, d.day).getDay();
}

function addDays(d: YMD, n: number): YMD {
  const date = new Date(d.year, d.month - 1, d.day + n);
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

function applyShift(cultural: YMD, shift: ObservedDateShift): YMD {
  switch (shift.kind) {
    case 'fixed_offset':
      return addDays(cultural, shift.days);

    case 'next_monday': {
      const dow = ymdToDayOfWeek(cultural);
      if (dow === 6) return addDays(cultural, 2);    // Saturday → Monday
      if (dow === 0) return addDays(cultural, 1);    // Sunday  → Monday
      return cultural;
    }

    case 'nearest_weekday': {
      const dow = ymdToDayOfWeek(cultural);
      if (dow === 6) return addDays(cultural, -1);   // Saturday → Friday
      if (dow === 0) return addDays(cultural, 1);    // Sunday  → Monday
      return cultural;
    }
  }
}

function ymdEqual(a: YMD, b: YMD): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

function resolveObservedCore(
  holidayId: string,
  culturalDate: YMD,
  countryCode: string | undefined,
): YMD | null {
  if (!countryCode) return null;

  const rule =
    OBSERVED_RULES.get(`${holidayId}:${countryCode}`) ??
    OBSERVED_RULES.get(`${holidayId}:*`) ??
    null;

  if (!rule) return null;

  const observed = applyShift(culturalDate, rule);
  return ymdEqual(observed, culturalDate) ? null : observed;
}

function getObservedOrCultural(
  holidayId: string,
  culturalDate: YMD,
  countryCode: string | undefined,
): YMD {
  return resolveObservedCore(holidayId, culturalDate, countryCode) ?? culturalDate;
}

/**
 * Resolves the public-holiday observed date for a given holiday + country.
 * Returns `null` when the observed date is the same as the cultural date
 * (i.e. no shift needed or no rule exists).
 */
export function resolveObservedDate(
  holidayId: string,
  culturalDate: YMD,
  countryCode: string | undefined,
): YMD | null {
  const coreObserved = resolveObservedCore(holidayId, culturalDate, countryCode);
  if (!coreObserved) return null;

  // In NZ/UK/AU/CA, Boxing Day can become Tuesday when Christmas also shifts to Monday.
  if (holidayId === 'boxing_day') {
    const christmasDate: YMD = { year: culturalDate.year, month: 12, day: 25 };
    const christmasObserved = getObservedOrCultural('christmas', christmasDate, countryCode);
    if (ymdEqual(coreObserved, christmasObserved)) {
      return addDays(coreObserved, 1);
    }
  }

  // In NZ, Day after New Year's Day can move to Tuesday if New Year's Day is Mondayised.
  if (holidayId === 'day_after_new_years_day') {
    const newYearsDate: YMD = { year: culturalDate.year, month: 1, day: 1 };
    const newYearsObserved = getObservedOrCultural('new_years_day', newYearsDate, countryCode);
    if (ymdEqual(coreObserved, newYearsObserved)) {
      return addDays(coreObserved, 1);
    }
  }

  return coreObserved;
}
