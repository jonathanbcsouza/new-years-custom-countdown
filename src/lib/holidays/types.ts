/**
 * Holiday domain model: types for the adaptive celebration engine.
 */

export type HolidayDateRuleKind =
  | 'fixed'
  | 'nth_weekday'
  | 'last_weekday'
  | 'provider'
  | 'table'
  | 'range_start';

export type ThemeVariant =
  | 'new_year'
  | 'christmas'
  | 'valentine'
  | 'easter'
  | 'halloween'
  | 'lunar_new_year'
  | 'diwali'
  | 'carnival'
  | 'ramadan'
  | 'pride'
  | 'independence'
  | 'thanksgiving'
  | 'spring'
  | 'summer'
  | 'fall'
  | 'winter'
  | 'cultural'
  | 'default';

export interface FixedDateRule {
  kind: 'fixed';
  month: number;
  day: number;
}

export interface NthWeekdayRule {
  kind: 'nth_weekday';
  month: number;
  /** 1-based week number (1 = first, 2 = second, etc.) */
  week: number;
  /** 0 = Sunday, 1 = Monday, ... 6 = Saturday */
  dayOfWeek: number;
}

export interface LastWeekdayRule {
  kind: 'last_weekday';
  month: number;
  dayOfWeek: number;
}

export interface ProviderRule {
  kind: 'provider';
  providerId: string;
}

export interface TableRule {
  kind: 'table';
  tableId: string;
}

export interface RangeStartRule {
  kind: 'range_start';
  /** Uses another rule to compute the start; countdowns target this date. */
  innerRule: HolidayDateRule;
  durationDays: number;
}

export type HolidayDateRule =
  | FixedDateRule
  | NthWeekdayRule
  | LastWeekdayRule
  | ProviderRule
  | TableRule
  | RangeStartRule;

export interface HolidayDefinition {
  id: string;
  nameKey: string;
  emoji: string;
  markets: string[] | 'worldwide';
  rule: HolidayDateRule;
  /** Celebration window in hours after the start of the event day. */
  windowHours: number;
  /** Higher = more important when multiple holidays compete for the same day. */
  priority: number;
  theme: ThemeVariant;
}

export interface ResolvedHoliday {
  definition: HolidayDefinition;
  /** Gregorian date of the next occurrence. */
  date: { year: number; month: number; day: number };
}

export interface HolidayContext {
  timezone: string;
  countryCode: string | undefined;
}

export interface DateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}
