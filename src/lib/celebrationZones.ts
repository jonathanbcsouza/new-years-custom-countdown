/**
 * One representative IANA timezone per country/region for the global celebration tracker.
 * Data via countries-and-timezones (ISO-derived list).
 */

import { getAllCountries, getTimezonesForCountry } from 'countries-and-timezones';

export interface CelebrationZone {
  city: string;
  country: string;
  /** ISO 3166-1 alpha-2 (for cultural New Year rules). */
  countryCode: string;
  timezone: string;
}

/** Prefer capital / largest-population zone for multi-timezone countries. */
const PRIMARY_TIMEZONE_OVERRIDE: Partial<Record<string, string>> = {
  US: 'America/New_York',
  RU: 'Europe/Moscow',
  CA: 'America/Toronto',
  BR: 'America/Sao_Paulo',
  AU: 'Australia/Sydney',
  AR: 'America/Argentina/Buenos_Aires',
  MX: 'America/Mexico_City',
  AQ: 'Pacific/Auckland',
  KZ: 'Asia/Almaty',
  CL: 'America/Santiago',
  GL: 'America/Nuuk',
  ID: 'Asia/Jakarta',
  ES: 'Europe/Madrid',
  FM: 'Pacific/Port_Moresby',
  KI: 'Pacific/Tarawa',
  PF: 'Pacific/Tahiti',
  PT: 'Europe/Lisbon',
  CD: 'Africa/Lagos',
  CN: 'Asia/Shanghai',
  CY: 'Asia/Nicosia',
  DE: 'Europe/Berlin',
  EC: 'America/Guayaquil',
  MH: 'Pacific/Tarawa',
  MN: 'Asia/Ulaanbaatar',
  MY: 'Asia/Singapore',
};

function resolvePrimaryTimezone(countryId: string): string | null {
  const tzs = getTimezonesForCountry(countryId);
  if (!tzs?.length) return null;
  const preferred = PRIMARY_TIMEZONE_OVERRIDE[countryId];
  if (preferred) {
    const hit = tzs.find((t) => t.name === preferred);
    if (hit) return hit.name;
  }
  return tzs[0]!.name;
}

function cityFromIana(timezone: string): string {
  const parts = timezone.split('/');
  return parts[parts.length - 1]!.replace(/_/g, ' ');
}

function offsetMinutes(isoTz: string, date: Date): number {
  try {
    const raw =
      new Intl.DateTimeFormat('en', {
        timeZone: isoTz,
        timeZoneName: 'longOffset',
      })
        .formatToParts(date)
        .find((p) => p.type === 'timeZoneName')?.value ?? '';
    const m = raw.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!m) return 0;
    const sign = m[1] === '-' ? -1 : 1;
    const h = parseInt(m[2]!, 10);
    const min = m[3] ? parseInt(m[3], 10) : 0;
    return sign * (h * 60 + min);
  } catch {
    return 0;
  }
}

let cachedZones: CelebrationZone[] | null = null;

function getCelebrationZonesList(): CelebrationZone[] {
  if (cachedZones) return cachedZones;
  const countries = getAllCountries();
  const out: CelebrationZone[] = [];
  for (const id of Object.keys(countries)) {
    const tz = resolvePrimaryTimezone(id);
    if (!tz) continue;
    const meta = countries[id as keyof typeof countries];
    out.push({
      city: cityFromIana(tz),
      country: meta.name,
      countryCode: id,
      timezone: tz,
    });
  }
  cachedZones = out;
  return out;
}

/** Sort east → west (first to hit midnight tends toward higher offset). */
export function getCelebrationZonesSortedAt(date: Date): CelebrationZone[] {
  const list = getCelebrationZonesList();
  return [...list].sort((a, b) => {
    const da = offsetMinutes(a.timezone, date);
    const db = offsetMinutes(b.timezone, date);
    if (db !== da) return db - da;
    return a.country.localeCompare(b.country);
  });
}

/** UTC offset label for badge, DST-aware (e.g. +9, -5, +5:30). */
export function getCelebrationOffsetLabel(timezone: string, date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    });
    const raw =
      formatter.formatToParts(date).find((p) => p.type === 'timeZoneName')?.value || '';
    const m = raw.match(/GMT([+-]\d{1,2}(?::\d{2})?)/i);
    if (m) return m[1]!.replace(':', '');
    return raw.replace(/^GMT/i, '').trim() || '+0';
  } catch {
    return '';
  }
}
