/** Localized region name for an ISO 3166-1 alpha-2 code. */
export function getCountryDisplayName(
  countryCode: string,
  locale: string,
): string {
  try {
    const dn = new Intl.DisplayNames([locale], { type: 'region' });
    return dn.of(countryCode) ?? countryCode;
  } catch {
    return countryCode;
  }
}
