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
 * Calculates the New Year's Date for a given timezone
 * @param timezone - IANA timezone string
 * @returns Date object representing when New Year's arrives in that timezone
 */
export function getNewYearDate(timezone: string): Date {
  const now = new Date();
  const { year, month, day, hour, minute, second } = getDatePartsInTimezone(
    now,
    timezone
  );

  // Target year: always next year (handles Jan 1 correctly)
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
  return new Date(now.getTime() + msUntilNewYear);
}
