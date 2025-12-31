/**
 * Geolocation utilities for timezone detection and date calculations
 */

// Constants
const API_TIMEOUT_MS = 3000;
const GEOLOCATION_API_URL = 'https://ip-api.com/json/?fields=timezone';

/**
 * Fetches the user's timezone using IP geolocation with fallbacks
 * @returns Promise<string> - IANA timezone string (e.g., "Pacific/Auckland")
 */
export async function getUserTimezone(): Promise<string> {
  try {
    const response = await fetch(GEOLOCATION_API_URL, {
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (data.timezone && typeof data.timezone === 'string') {
      return data.timezone;
    }
  } catch (error) {
    console.warn('IP geolocation failed, using browser timezone:', error);
  }

  // Fallback: Browser timezone (reliable, no network)
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (browserTimezone) {
    return browserTimezone;
  }

  // Last resort: UTC
  return 'UTC';
}

/**
 * Extracts date/time components from a Date object in a specific timezone
 */
function getDatePartsInTimezone(date: Date, timezone: string) {
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

/**
 * Result of New Year calculation
 */
export interface NewYearResult {
  targetDate: Date;
  isCelebrationPeriod: boolean;
  celebrationEndDate: Date | null;
}

/**
 * Calculates the New Year's Date for a given timezone
 * If New Year's has already passed but is within 24 hours, returns celebration state
 * @param timezone - IANA timezone string
 * @returns NewYearResult with target date and celebration status
 */
export function getNewYearDate(timezone: string): NewYearResult {
  const now = new Date();
  const { year, month, day, hour, minute, second } = getDatePartsInTimezone(
    now,
    timezone
  );

  // Check if we're on January 1st
  const isJanuary1st = month === 1 && day === 1;

  if (isJanuary1st) {
    // Calculate how many hours since midnight
    const hoursSinceMidnight = hour + minute / 60 + second / 3600;

    // If within 24 hours of New Year's (midnight Jan 1), show celebration
    if (hoursSinceMidnight < 24) {
      // Calculate milliseconds since midnight in the target timezone
      const msSinceMidnight = (hour * 3600 + minute * 60 + second) * 1000;
      const msIn24Hours = 24 * 60 * 60 * 1000;

      // Celebration ends 24 hours after midnight Jan 1st in the target timezone
      // This is when Jan 2nd 00:00:00 arrives in the target timezone
      const celebrationEndDate = new Date(
        now.getTime() + (msIn24Hours - msSinceMidnight)
      );

      return {
        targetDate: celebrationEndDate,
        isCelebrationPeriod: true,
        celebrationEndDate,
      };
    }
  }

  // Normal case: calculate next New Year's
  const targetYear = year + 1;

  // Create timestamps for comparison (using local Date constructor)
  const currentTimeMs = new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    second
  ).getTime();
  const targetTimeMs = new Date(targetYear, 0, 1, 0, 0, 0).getTime();

  // Calculate milliseconds until New Year's
  const msUntilNewYear = targetTimeMs - currentTimeMs;

  // Return the actual UTC moment when New Year's arrives
  return {
    targetDate: new Date(now.getTime() + msUntilNewYear),
    isCelebrationPeriod: false,
    celebrationEndDate: null,
  };
}
