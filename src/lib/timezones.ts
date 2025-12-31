/**
 * Timezone utilities with country and continent grouping
 */

// Mapping of timezone cities to their countries
const TIMEZONE_COUNTRIES: Record<string, string> = {
  // Africa
  'Africa/Abidjan': 'Ivory Coast',
  'Africa/Accra': 'Ghana',
  'Africa/Addis_Ababa': 'Ethiopia',
  'Africa/Algiers': 'Algeria',
  'Africa/Cairo': 'Egypt',
  'Africa/Casablanca': 'Morocco',
  'Africa/Johannesburg': 'South Africa',
  'Africa/Lagos': 'Nigeria',
  'Africa/Nairobi': 'Kenya',
  'Africa/Tunis': 'Tunisia',
  
  // America
  'America/Anchorage': 'United States',
  'America/Argentina/Buenos_Aires': 'Argentina',
  'America/Bogota': 'Colombia',
  'America/Caracas': 'Venezuela',
  'America/Chicago': 'United States',
  'America/Denver': 'United States',
  'America/Detroit': 'United States',
  'America/Edmonton': 'Canada',
  'America/Halifax': 'Canada',
  'America/Havana': 'Cuba',
  'America/Lima': 'Peru',
  'America/Los_Angeles': 'United States',
  'America/Manaus': 'Brazil',
  'America/Mexico_City': 'Mexico',
  'America/Montreal': 'Canada',
  'America/New_York': 'United States',
  'America/Panama': 'Panama',
  'America/Phoenix': 'United States',
  'America/Santiago': 'Chile',
  'America/Sao_Paulo': 'Brazil',
  'America/Toronto': 'Canada',
  'America/Vancouver': 'Canada',
  'America/Winnipeg': 'Canada',
  
  // Asia
  'Asia/Almaty': 'Kazakhstan',
  'Asia/Amman': 'Jordan',
  'Asia/Baghdad': 'Iraq',
  'Asia/Baku': 'Azerbaijan',
  'Asia/Bangkok': 'Thailand',
  'Asia/Beirut': 'Lebanon',
  'Asia/Colombo': 'Sri Lanka',
  'Asia/Damascus': 'Syria',
  'Asia/Dhaka': 'Bangladesh',
  'Asia/Dubai': 'United Arab Emirates',
  'Asia/Ho_Chi_Minh': 'Vietnam',
  'Asia/Hong_Kong': 'Hong Kong',
  'Asia/Istanbul': 'Turkey',
  'Asia/Jakarta': 'Indonesia',
  'Asia/Jerusalem': 'Israel',
  'Asia/Kabul': 'Afghanistan',
  'Asia/Karachi': 'Pakistan',
  'Asia/Kathmandu': 'Nepal',
  'Asia/Kolkata': 'India',
  'Asia/Kuala_Lumpur': 'Malaysia',
  'Asia/Kuwait': 'Kuwait',
  'Asia/Manila': 'Philippines',
  'Asia/Muscat': 'Oman',
  'Asia/Qatar': 'Qatar',
  'Asia/Riyadh': 'Saudi Arabia',
  'Asia/Seoul': 'South Korea',
  'Asia/Shanghai': 'China',
  'Asia/Singapore': 'Singapore',
  'Asia/Taipei': 'Taiwan',
  'Asia/Tashkent': 'Uzbekistan',
  'Asia/Tehran': 'Iran',
  'Asia/Tokyo': 'Japan',
  
  // Australia & Pacific
  'Australia/Adelaide': 'Australia',
  'Australia/Brisbane': 'Australia',
  'Australia/Darwin': 'Australia',
  'Australia/Hobart': 'Australia',
  'Australia/Melbourne': 'Australia',
  'Australia/Perth': 'Australia',
  'Australia/Sydney': 'Australia',
  'Pacific/Auckland': 'New Zealand',
  'Pacific/Fiji': 'Fiji',
  'Pacific/Guam': 'Guam',
  'Pacific/Honolulu': 'United States',
  'Pacific/Noumea': 'New Caledonia',
  'Pacific/Pago_Pago': 'American Samoa',
  'Pacific/Port_Moresby': 'Papua New Guinea',
  'Pacific/Tahiti': 'French Polynesia',
  
  // Europe
  'Europe/Amsterdam': 'Netherlands',
  'Europe/Athens': 'Greece',
  'Europe/Belgrade': 'Serbia',
  'Europe/Berlin': 'Germany',
  'Europe/Brussels': 'Belgium',
  'Europe/Bucharest': 'Romania',
  'Europe/Budapest': 'Hungary',
  'Europe/Copenhagen': 'Denmark',
  'Europe/Dublin': 'Ireland',
  'Europe/Helsinki': 'Finland',
  'Europe/Kiev': 'Ukraine',
  'Europe/Lisbon': 'Portugal',
  'Europe/London': 'United Kingdom',
  'Europe/Madrid': 'Spain',
  'Europe/Milan': 'Italy',
  'Europe/Moscow': 'Russia',
  'Europe/Oslo': 'Norway',
  'Europe/Paris': 'France',
  'Europe/Prague': 'Czech Republic',
  'Europe/Rome': 'Italy',
  'Europe/Stockholm': 'Sweden',
  'Europe/Vienna': 'Austria',
  'Europe/Warsaw': 'Poland',
  'Europe/Zurich': 'Switzerland',
};

// Continent display names
const CONTINENT_NAMES: Record<string, string> = {
  'Africa': 'Africa',
  'America': 'Americas',
  'Antarctica': 'Antarctica',
  'Arctic': 'Arctic',
  'Asia': 'Asia',
  'Atlantic': 'Atlantic',
  'Australia': 'Australia',
  'Europe': 'Europe',
  'Indian': 'Indian Ocean',
  'Pacific': 'Pacific',
};

export interface TimezoneOption {
  value: string;
  city: string;
  country: string;
  continent: string;
  offset: string;
  searchText: string;
}

export interface CountryGroup {
  country: string;
  timezones: TimezoneOption[];
}

export interface ContinentGroup {
  continent: string;
  continentLabel: string;
  countries: CountryGroup[];
}

/**
 * Gets the country for a timezone
 */
function getCountryForTimezone(timezone: string): string {
  // Check direct mapping first
  if (TIMEZONE_COUNTRIES[timezone]) {
    return TIMEZONE_COUNTRIES[timezone];
  }
  
  // Try to extract from the timezone string
  const parts = timezone.split('/');
  if (parts.length >= 2) {
    // For timezones like "America/Argentina/Buenos_Aires"
    if (parts.length === 3) {
      return parts[1].replace(/_/g, ' ');
    }
    // Default: use city as country indicator
    return parts[1].replace(/_/g, ' ');
  }
  
  return 'Other';
}

/**
 * Gets the timezone offset string
 */
function getTimezoneOffset(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find((p) => p.type === 'timeZoneName');
    return offsetPart?.value || '';
  } catch {
    return '';
  }
}

/**
 * Gets the city name from a timezone
 */
function getCityFromTimezone(timezone: string): string {
  const parts = timezone.split('/');
  return parts[parts.length - 1].replace(/_/g, ' ');
}

/**
 * Gets all timezones with full metadata
 */
export function getTimezoneOptions(): TimezoneOption[] {
  const timezones = Intl.supportedValuesOf('timeZone');
  
  return timezones.map((tz) => {
    const parts = tz.split('/');
    const continent = parts[0];
    const city = getCityFromTimezone(tz);
    const country = getCountryForTimezone(tz);
    const offset = getTimezoneOffset(tz);
    
    return {
      value: tz,
      city,
      country,
      continent,
      offset,
      searchText: `${city} ${country} ${continent} ${tz}`.toLowerCase(),
    };
  });
}

/**
 * Gets timezones grouped by continent and country
 */
export function getGroupedTimezones(): ContinentGroup[] {
  const options = getTimezoneOptions();
  
  // Group by continent first
  const continentMap = new Map<string, Map<string, TimezoneOption[]>>();
  
  options.forEach((opt) => {
    if (!continentMap.has(opt.continent)) {
      continentMap.set(opt.continent, new Map());
    }
    const countryMap = continentMap.get(opt.continent)!;
    
    if (!countryMap.has(opt.country)) {
      countryMap.set(opt.country, []);
    }
    countryMap.get(opt.country)!.push(opt);
  });
  
  // Convert to array structure and sort
  const result: ContinentGroup[] = [];
  
  const sortedContinents = Array.from(continentMap.keys()).sort();
  
  sortedContinents.forEach((continent) => {
    const countryMap = continentMap.get(continent)!;
    const countries: CountryGroup[] = [];
    
    const sortedCountries = Array.from(countryMap.keys()).sort();
    
    sortedCountries.forEach((country) => {
      const timezones = countryMap.get(country)!;
      timezones.sort((a, b) => a.city.localeCompare(b.city));
      
      countries.push({
        country,
        timezones,
      });
    });
    
    result.push({
      continent,
      continentLabel: CONTINENT_NAMES[continent] || continent,
      countries,
    });
  });
  
  return result;
}

/**
 * Formats a timezone for display
 */
export function formatTimezone(timezone: string): string {
  const city = getCityFromTimezone(timezone);
  const offset = getTimezoneOffset(timezone);
  return `${city} (${offset})`;
}

/**
 * Gets all timezones as a flat list
 */
export function getAllTimezones(): string[] {
  return Intl.supportedValuesOf('timeZone');
}
