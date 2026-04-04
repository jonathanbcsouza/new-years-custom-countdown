import { getCountriesForTimezone } from 'countries-and-timezones';

/** First ISO country linked to an IANA zone (multi-country zones pick one). */
export function getPrimaryCountryCodeForTimezone(
  timezone: string
): string | undefined {
  const list = getCountriesForTimezone(timezone);
  return list[0]?.id;
}
