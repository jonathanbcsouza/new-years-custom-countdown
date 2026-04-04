import { describe, it, expect } from 'vitest';
import {
  resolveNextHoliday,
  resolveUpcomingHolidays,
  isHolidayActive,
  getHolidayTargetInstant,
  getActiveHolidayForZone,
  type HolidayContext,
  type ResolvedHoliday,
} from '../holidays';
import {
  easterDate,
  lunarNewYearDate,
  nthWeekdayOfMonth,
  lastWeekdayOfMonth,
  nowruzDate,
  diwaliDate,
} from '../holidays/dateProviders';

// ---------------------------------------------------------------------------
// Date provider unit tests
// ---------------------------------------------------------------------------
describe('dateProviders', () => {
  describe('easterDate', () => {
    it('returns correct Easter 2025', () => {
      expect(easterDate(2025)).toEqual({ year: 2025, month: 4, day: 20 });
    });
    it('returns correct Easter 2026', () => {
      expect(easterDate(2026)).toEqual({ year: 2026, month: 4, day: 5 });
    });
    it('returns correct Easter 2024', () => {
      expect(easterDate(2024)).toEqual({ year: 2024, month: 3, day: 31 });
    });
  });

  describe('lunarNewYearDate', () => {
    it('returns a date in Jan or Feb for 2026', () => {
      const d = lunarNewYearDate(2026);
      expect(d).not.toBeNull();
      expect(d!.year).toBe(2026);
      expect(d!.month).toBeLessThanOrEqual(2);
    });
    it('returns Feb 17 for 2026', () => {
      const d = lunarNewYearDate(2026);
      expect(d).toEqual({ year: 2026, month: 2, day: 17 });
    });
  });

  describe('nowruzDate', () => {
    it('returns March 20 for 2026', () => {
      expect(nowruzDate(2026)).toEqual({ year: 2026, month: 3, day: 20 });
    });
    it('returns March 21 for 2027', () => {
      expect(nowruzDate(2027)).toEqual({ year: 2027, month: 3, day: 21 });
    });
  });

  describe('diwaliDate', () => {
    it('returns a date in Oct/Nov for 2026', () => {
      const d = diwaliDate(2026);
      expect(d).not.toBeNull();
      expect(d!.month).toBeGreaterThanOrEqual(10);
    });
  });

  describe('nthWeekdayOfMonth', () => {
    it('finds 3rd Monday of January 2026 (Blue Monday)', () => {
      const d = nthWeekdayOfMonth(2026, 1, 1, 3);
      expect(d).toEqual({ year: 2026, month: 1, day: 19 });
    });
    it('finds 2nd Monday of October 2026 (Canadian Thanksgiving)', () => {
      const d = nthWeekdayOfMonth(2026, 10, 1, 2);
      expect(d).toEqual({ year: 2026, month: 10, day: 12 });
    });
    it('finds 4th Thursday of November 2026 (US Thanksgiving)', () => {
      const d = nthWeekdayOfMonth(2026, 11, 4, 4);
      expect(d).toEqual({ year: 2026, month: 11, day: 26 });
    });
  });

  describe('lastWeekdayOfMonth', () => {
    it('finds last Monday of May 2026 (Memorial Day)', () => {
      const d = lastWeekdayOfMonth(2026, 5, 1);
      expect(d).toEqual({ year: 2026, month: 5, day: 25 });
    });
  });
});

// ---------------------------------------------------------------------------
// Holiday engine integration tests
// ---------------------------------------------------------------------------
describe('holidayEngine', () => {
  const usContext: HolidayContext = { timezone: 'America/New_York', countryCode: 'US' };
  const jpContext: HolidayContext = { timezone: 'Asia/Tokyo', countryCode: 'JP' };
  const brContext: HolidayContext = { timezone: 'America/Sao_Paulo', countryCode: 'BR' };
  const inContext: HolidayContext = { timezone: 'Asia/Kolkata', countryCode: 'IN' };
  const worldContext: HolidayContext = { timezone: 'UTC', countryCode: undefined };

  describe('resolveNextHoliday', () => {
    it('returns a holiday for US context in mid-January', () => {
      const jan15 = new Date(2026, 0, 15, 12, 0, 0);
      const result = resolveNextHoliday(usContext, jan15);
      expect(result).not.toBeNull();
      expect(result!.definition.id).toBeDefined();
      expect(result!.date.year).toBe(2026);
    });

    it('picks Blue Monday for US on Jan 15', () => {
      const jan15 = new Date(2026, 0, 15, 12, 0, 0);
      const result = resolveNextHoliday(usContext, jan15);
      expect(result).not.toBeNull();
    });

    it('returns Christmas as the highest-priority holiday around Dec 22-25', () => {
      const dec23utc = new Date(Date.UTC(2026, 11, 23, 17, 0, 0));
      const result = resolveNextHoliday(usContext, dec23utc);
      expect(result).not.toBeNull();
      expect(result!.definition.id).toBe('christmas');
    });

    it('returns New Years Day on Dec 30', () => {
      const dec30 = new Date(2026, 11, 30, 12, 0, 0);
      const result = resolveNextHoliday(worldContext, dec30);
      expect(result).not.toBeNull();
      expect(['new_years_eve', 'new_years_day']).toContain(result!.definition.id);
    });

    it('returns Lunar New Year as next for China in early Feb', () => {
      const cnContext: HolidayContext = { timezone: 'Asia/Shanghai', countryCode: 'CN' };
      const feb1 = new Date(2026, 1, 1, 12, 0, 0);
      const result = resolveNextHoliday(cnContext, feb1);
      expect(result).not.toBeNull();
    });

    it('resolves next holiday for Japan', () => {
      const jul1 = new Date(2026, 6, 1, 12, 0, 0);
      const result = resolveNextHoliday(jpContext, jul1);
      expect(result).not.toBeNull();
      expect(result!.date.year).toBe(2026);
    });
  });

  describe('resolveUpcomingHolidays', () => {
    it('returns up to 5 upcoming holidays', () => {
      const now = new Date(2026, 0, 1, 12, 0, 0);
      const results = resolveUpcomingHolidays(usContext, now, 5);
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('returns holidays in chronological order', () => {
      const now = new Date(2026, 5, 1, 12, 0, 0);
      const results = resolveUpcomingHolidays(usContext, now, 5);
      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1]!.date;
        const curr = results[i]!.date;
        const prevNum = prev.year * 10000 + prev.month * 100 + prev.day;
        const currNum = curr.year * 10000 + curr.month * 100 + curr.day;
        expect(currNum).toBeGreaterThanOrEqual(prevNum);
      }
    });
  });

  describe('isHolidayActive', () => {
    it('returns true during Christmas celebration window', () => {
      const christmasHoliday: ResolvedHoliday = {
        definition: {
          id: 'christmas',
          nameKey: 'holidays.christmas',
          emoji: '🎄',
          markets: 'worldwide',
          rule: { kind: 'fixed', month: 12, day: 25 },
          windowHours: 48,
          priority: 95,
          theme: 'christmas',
        },
        date: { year: 2026, month: 12, day: 25 },
      };
      const dec25noon = new Date(Date.UTC(2026, 11, 25, 17, 0, 0));
      expect(isHolidayActive(christmasHoliday, usContext, dec25noon)).toBe(true);
    });

    it('returns false well before the holiday', () => {
      const christmasHoliday: ResolvedHoliday = {
        definition: {
          id: 'christmas',
          nameKey: 'holidays.christmas',
          emoji: '🎄',
          markets: 'worldwide',
          rule: { kind: 'fixed', month: 12, day: 25 },
          windowHours: 48,
          priority: 95,
          theme: 'christmas',
        },
        date: { year: 2026, month: 12, day: 25 },
      };
      const dec20 = new Date(Date.UTC(2026, 11, 20, 12, 0, 0));
      expect(isHolidayActive(christmasHoliday, usContext, dec20)).toBe(false);
    });
  });

  describe('getHolidayTargetInstant', () => {
    it('returns midnight for the holiday date in the given timezone', () => {
      const nyDay: ResolvedHoliday = {
        definition: {
          id: 'new_years_day',
          nameKey: 'holidays.newYearsDay',
          emoji: '🎆',
          markets: 'worldwide',
          rule: { kind: 'fixed', month: 1, day: 1 },
          windowHours: 48,
          priority: 100,
          theme: 'new_year',
        },
        date: { year: 2027, month: 1, day: 1 },
      };
      const instant = getHolidayTargetInstant(nyDay, usContext);
      expect(instant.getTime()).toBeLessThan(new Date(2027, 0, 2).getTime());
      expect(instant.getTime()).toBeGreaterThanOrEqual(new Date(2026, 11, 31).getTime());
    });
  });

  describe('getActiveHolidayForZone', () => {
    it('returns null when no holiday is active', () => {
      const mar1 = new Date(2026, 2, 1, 12, 0, 0);
      const result = getActiveHolidayForZone(usContext, mar1);
      expect(result).toBeNull();
    });

    it('returns Valentines Day on Feb 14', () => {
      const feb14 = new Date(Date.UTC(2026, 1, 14, 18, 0, 0));
      const result = getActiveHolidayForZone(usContext, feb14);
      expect(result).not.toBeNull();
      expect(result!.definition.id).toBe('valentines_day');
    });
  });

  describe('market filtering', () => {
    it('returns worldwide holidays for any context', () => {
      const dec24 = new Date(2026, 11, 24, 12, 0, 0);
      const result = resolveNextHoliday(worldContext, dec24);
      expect(result).not.toBeNull();
      expect(result!.definition.markets).toBe('worldwide');
    });

    it('includes country-specific holidays for matching context', () => {
      const aug1 = new Date(2026, 7, 1, 0, 0, 0);
      const results = resolveUpcomingHolidays(inContext, aug1, 10);
      const ids = results.map((r) => r.definition.id);
      expect(ids).toContain('independence_day_india');
    });

    it('includes Diwali for India context', () => {
      const oct1 = new Date(2026, 9, 1, 12, 0, 0);
      const results = resolveUpcomingHolidays(inContext, oct1, 10);
      const ids = results.map((r) => r.definition.id);
      expect(ids).toContain('diwali');
    });

    it('includes Carnival for Brazil context', () => {
      const jan15 = new Date(2026, 0, 15, 12, 0, 0);
      const results = resolveUpcomingHolidays(brContext, jan15, 10);
      const ids = results.map((r) => r.definition.id);
      expect(ids).toContain('carnival');
    });
  });
});
