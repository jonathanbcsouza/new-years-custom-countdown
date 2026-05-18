import { isWorldwideHolidayDefinition } from './engine';
import type { ResolvedHoliday } from './types';

/** Split holidays into worldwide vs regional (country-specific) buckets. */
export function partitionHolidaysByWorldwide(holidays: ResolvedHoliday[]): {
  worldwide: ResolvedHoliday[];
  regional: ResolvedHoliday[];
} {
  const worldwide: ResolvedHoliday[] = [];
  const regional: ResolvedHoliday[] = [];
  for (const h of holidays) {
    if (isWorldwideHolidayDefinition(h.definition)) {
      worldwide.push(h);
    } else {
      regional.push(h);
    }
  }
  return { worldwide, regional };
}
