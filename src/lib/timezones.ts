/**
 * Timezone utilities and data
 */

/**
 * Gets all IANA timezones sorted by common usage
 * @returns Array of timezone strings
 */
export function getAllTimezones(): string[] {
  // Get all IANA timezones
  const timezones = Intl.supportedValuesOf('timeZone');

  // Sort by common usage (major cities first, then alphabetical)
  const commonTimezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'America/Toronto',
    'America/Vancouver',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Europe/Madrid',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Hong_Kong',
    'Asia/Singapore',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Pacific/Auckland',
    'Pacific/Honolulu',
  ];

  // Create a set for quick lookup
  const commonSet = new Set(commonTimezones);

  // Separate common and other timezones
  const common = timezones.filter((tz) => commonSet.has(tz));
  const others = timezones.filter((tz) => !commonSet.has(tz));

  // Sort others alphabetically
  others.sort();

  // Return common first, then others
  return [...common, ...others];
}

/**
 * Formats a timezone string for display
 * @param timezone - IANA timezone string (e.g., "America/New_York")
 * @returns Formatted string (e.g., "New York (America/New_York)")
 */
export function formatTimezone(timezone: string): string {
  // Extract city name from timezone string
  const parts = timezone.split('/');
  const city = parts[parts.length - 1].replace(/_/g, ' ');

  // Get timezone offset for additional context
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    timeZoneName: 'short',
  });

  const partsWithTz = formatter.formatToParts(now);
  const tzName = partsWithTz.find((p) => p.type === 'timeZoneName')?.value || '';

  return `${city} (${tzName})`;
}

/**
 * Groups timezones by region for better organization
 */
export interface TimezoneGroup {
  region: string;
  timezones: Array<{ value: string; label: string }>;
}

export function getGroupedTimezones(): TimezoneGroup[] {
  const timezones = getAllTimezones();
  const groups: Record<string, Array<{ value: string; label: string }>> = {};

  timezones.forEach((tz) => {
    const [region] = tz.split('/');
    if (!groups[region]) {
      groups[region] = [];
    }

    const parts = tz.split('/');
    const city = parts[parts.length - 1].replace(/_/g, ' ');

    groups[region].push({
      value: tz,
      label: `${city} (${tz})`,
    });
  });

  // Sort regions
  const sortedRegions = Object.keys(groups).sort();

  return sortedRegions.map((region) => ({
    region,
    timezones: groups[region],
  }));
}

