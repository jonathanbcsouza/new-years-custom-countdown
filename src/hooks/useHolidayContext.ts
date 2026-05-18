import { useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getPrimaryCountryCodeForTimezone } from '@/lib/timezoneCountry';
import { getCountryDisplayName } from '@/lib/countryDisplay';
import type { HolidayContext } from '@/lib/holidays';

/** Same key as countdown home — keeps browse lens in sync with timezone picker. */
export const TIMEZONE_STORAGE_KEY = 'countdown-timezone';

function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

/**
 * User's holiday lens: stored countdown timezone (or browser default) → country.
 */
export function useHolidayContext(locale: string) {
  const [storedTimezone] = useLocalStorage<string | null>(TIMEZONE_STORAGE_KEY, null);

  const timezone = storedTimezone ?? getBrowserTimezone();
  const countryCode = useMemo(
    () => getPrimaryCountryCodeForTimezone(timezone),
    [timezone],
  );
  const context = useMemo(
    (): HolidayContext => ({ timezone, countryCode }),
    [timezone, countryCode],
  );
  const countryLabel = useMemo(
    () => (countryCode ? getCountryDisplayName(countryCode, locale) : undefined),
    [countryCode, locale],
  );

  return { timezone, countryCode, context, countryLabel };
}
