import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Search,
  Filter,
  Globe,
  X,
  Timer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StarryFireworksBackground } from '@/components/StarryFireworksBackground';
import { LanguageSelector } from '@/components/LanguageSelector';
import {
  resolveAllHolidaysForYear,
  resolveUpcomingHolidays,
  getTheme,
  isPublicHolidayDefinition,
  partitionHolidaysByWorldwide,
  type ResolvedHoliday,
  type ThemeVariant,
} from '@/lib/holidays';
import { usePublicHolidayFilter } from '@/hooks/usePublicHolidayFilter';
import { useHolidayContext } from '@/hooks/useHolidayContext';
import { useHolidayScopeFilter } from '@/hooks/useHolidayScopeFilter';
import { HolidayFilterToggle } from '@/components/HolidayFilterToggle';
import { HolidayScopeToggle } from '@/components/HolidayScopeToggle';

const MONTH_KEYS = [
  'months.jan', 'months.feb', 'months.mar', 'months.apr',
  'months.may', 'months.jun', 'months.jul', 'months.aug',
  'months.sep', 'months.oct', 'months.nov', 'months.dec',
] as const;

const THEME_OPTIONS: { value: ThemeVariant | 'all'; labelKey: string }[] = [
  { value: 'all', labelKey: 'holidaysPage.allCategories' },
  { value: 'new_year', labelKey: 'holidaysPage.catNewYear' },
  { value: 'christmas', labelKey: 'holidaysPage.catChristmas' },
  { value: 'easter', labelKey: 'holidaysPage.catEaster' },
  { value: 'valentine', labelKey: 'holidaysPage.catValentine' },
  { value: 'halloween', labelKey: 'holidaysPage.catHalloween' },
  { value: 'independence', labelKey: 'holidaysPage.catIndependence' },
  { value: 'cultural', labelKey: 'holidaysPage.catCultural' },
  { value: 'spring', labelKey: 'holidaysPage.catSpring' },
  { value: 'summer', labelKey: 'holidaysPage.catSummer' },
  { value: 'fall', labelKey: 'holidaysPage.catFall' },
  { value: 'winter', labelKey: 'holidaysPage.catWinter' },
  { value: 'lunar_new_year', labelKey: 'holidaysPage.catLunarNewYear' },
  { value: 'diwali', labelKey: 'holidaysPage.catDiwali' },
  { value: 'carnival', labelKey: 'holidaysPage.catCarnival' },
  { value: 'ramadan', labelKey: 'holidaysPage.catRamadan' },
  { value: 'pride', labelKey: 'holidaysPage.catPride' },
  { value: 'thanksgiving', labelKey: 'holidaysPage.catThanksgiving' },
];

function formatDate(ymd: { year: number; month: number; day: number }, locale: string): string {
  const d = new Date(ymd.year, ymd.month - 1, ymd.day);
  return new Intl.DateTimeFormat(locale, { weekday: 'short', month: 'short', day: 'numeric' }).format(d);
}

function daysUntil(ymd: { year: number; month: number; day: number }): number {
  const target = new Date(ymd.year, ymd.month - 1, ymd.day);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

function HolidayCard({
  holiday,
  locale,
  compact = false,
  onCountDown,
}: {
  holiday: ResolvedHoliday;
  locale: string;
  compact?: boolean;
  onCountDown?: (holidayId: string) => void;
}) {
  const { t } = useTranslation();
  const theme = getTheme(holiday.definition.theme);
  const name = t(holiday.definition.nameKey, {
    defaultValue: holiday.definition.nameKey.split('.').pop(),
  });
  const days = daysUntil(holiday.date);
  const isPast = days < 0;
  const isToday = days === 0;

  const markets = holiday.definition.markets === 'worldwide'
    ? t('holidaysPage.worldwide')
    : (holiday.definition.markets as string[]).join(', ');

  return (
    <div
      className={`rounded-xl border backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-lg ${
        isPast
          ? 'border-white/5 opacity-50'
          : isToday
            ? 'border-amber-400/40 shadow-amber-400/10 shadow-md'
            : 'border-white/10'
      } ${compact ? 'px-3 py-2.5' : 'px-4 py-3.5'}`}
      style={{
        background: `linear-gradient(135deg, ${theme.accentHsl.split(' ').length === 3 ? `hsla(${theme.accentHsl}, 0.08)` : 'rgba(255,255,255,0.03)'} 0%, rgba(0,0,0,0.2) 100%)`,
      }}
    >
      <div className="flex items-start gap-3">
        <span className={compact ? 'text-lg' : 'text-2xl'}>{holiday.definition.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={`font-semibold text-white truncate ${compact ? 'text-sm' : 'text-base'}`}>
              {name}
            </h3>
            {!isPast && (
              <span className={`shrink-0 text-xs font-mono px-2 py-0.5 rounded-full ${
                isToday
                  ? 'bg-amber-400/20 text-amber-300'
                  : days <= 7
                    ? 'bg-emerald-400/20 text-emerald-300'
                    : 'bg-white/10 text-white/50'
              }`}>
                {isToday
                  ? t('holidaysPage.today')
                  : days === 1
                    ? t('holidaysPage.tomorrow')
                    : t('holidaysPage.inDays', { count: days })}
              </span>
            )}
          </div>
          <p className="text-xs text-white/50 mt-0.5">
            {formatDate(holiday.date, locale)}
            {holiday.observedDate && (
              <span className="ml-1.5 text-amber-300/60 italic">
                ({t('countdown.publicHolidayOn', {
                  date: formatDate(holiday.observedDate, locale),
                })})
              </span>
            )}
          </p>
          {!compact && (
            <p className="text-[11px] text-white/30 mt-1 truncate flex items-center gap-1">
              <Globe className="h-3 w-3 inline shrink-0" />
              {markets}
            </p>
          )}
          {onCountDown && !isPast && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCountDown(holiday.definition.id);
              }}
              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-400/90
                         hover:text-amber-300 transition-colors"
            >
              <Timer className="h-3.5 w-3.5" />
              {t('holidaySelector.countDown', { defaultValue: 'Count down' })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MonthSubsection({
  label,
  showGlobe,
  holidays,
  locale,
  onCountDown,
}: {
  label: string;
  showGlobe?: boolean;
  holidays: ResolvedHoliday[];
  locale: string;
  onCountDown: (holidayId: string) => void;
}) {
  if (holidays.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        {showGlobe && <Globe className="h-3.5 w-3.5 text-white/40 shrink-0" />}
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
          {label}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {holidays.map((h) => (
          <HolidayCard
            key={h.definition.id}
            holiday={h}
            locale={locale}
            compact
            onCountDown={onCountDown}
          />
        ))}
      </div>
    </div>
  );
}

export function HolidaysPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const locale = i18n.language ?? 'en';
  const currentYear = new Date().getFullYear();

  const handleCountDown = (holidayId: string) => {
    navigate('/', { state: { holidayId } });
  };

  const [search, setSearch] = useState('');
  const [themeFilter, setThemeFilter] = useState<ThemeVariant | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const { publicOnly, setPublicOnly } = usePublicHolidayFilter();
  const { allCountries, setAllCountries } = useHolidayScopeFilter();
  const { context, countryLabel } = useHolidayContext(locale);
  const listOptions = useMemo(
    () => (publicOnly ? { publicOnly: true } : undefined),
    [publicOnly],
  );

  const scopedToRegion = !allCountries && context.countryCode;

  const upcoming = useMemo(() => {
    const ctx = scopedToRegion
      ? context
      : { timezone: 'UTC' as const, countryCode: undefined };
    return resolveUpcomingHolidays(ctx, new Date(), 12, listOptions);
  }, [scopedToRegion, context, listOptions]);

  const allHolidays = useMemo(() => {
    if (scopedToRegion) {
      return resolveAllHolidaysForYear(currentYear, context.countryCode);
    }
    return resolveAllHolidaysForYear(currentYear);
  }, [currentYear, scopedToRegion, context.countryCode]);

  const pageSubtitle = useMemo(() => {
    if (allCountries) {
      return t('holidaysPage.subtitleGlobal', { year: currentYear });
    }
    if (countryLabel) {
      return t('holidaysPage.subtitleYourRegion', {
        country: countryLabel,
        year: currentYear,
      });
    }
    return t('holidaysPage.subtitle', { year: currentYear });
  }, [allCountries, countryLabel, currentYear, t]);

  const showWorldwideGrouping = scopedToRegion && !search.trim();

  const filtered = useMemo(() => {
    let list = allHolidays;
    if (publicOnly) {
      list = list.filter((h) => isPublicHolidayDefinition(h.definition));
    }
    if (themeFilter !== 'all') {
      list = list.filter((h) => h.definition.theme === themeFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((h) => {
        const name = t(h.definition.nameKey, {
          defaultValue: h.definition.nameKey.split('.').pop(),
        }).toLowerCase();
        return name.includes(q) || h.definition.emoji.includes(q);
      });
    }
    return list;
  }, [allHolidays, publicOnly, themeFilter, search, t]);

  const groupedByMonth = useMemo(() => {
    const groups: Record<number, ResolvedHoliday[]> = {};
    for (const h of filtered) {
      const m = h.date.month;
      (groups[m] ??= []).push(h);
    }
    return groups;
  }, [filtered]);

  return (
    <>
      <StarryFireworksBackground celebrationMode={false} />

      <main className="min-h-screen flex flex-col relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-gradient-to-b from-[#0a0f23] via-[#0a0f23ee] to-transparent pb-4">
          <div className="flex items-center justify-between px-4 pt-4">
            <div className="flex items-center gap-2">
              <Link to="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10 gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-xs hidden sm:inline">{t('common.back')}</span>
                </Button>
              </Link>
              <LanguageSelector />
            </div>
          </div>

          <div className="text-center mt-4 mb-4 px-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Calendar className="h-6 w-6 md:h-8 md:w-8 text-amber-400" />
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
                {t('holidaysPage.title')}
              </h1>
            </div>
            <p className="text-sm text-white/50">{pageSubtitle}</p>
          </div>

          {/* Search + filter toggle */}
          <div className="flex items-center gap-2 px-4 max-w-3xl mx-auto w-full">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('holidaysPage.searchPlaceholder')}
                className="w-full pl-9 pr-8 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/40 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`shrink-0 p-2 rounded-lg border transition-colors ${
                showFilters || themeFilter !== 'all'
                  ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                  : 'border-white/10 bg-white/5 text-white/40 hover:text-white/60'
              }`}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>

          <div className="px-4 mt-3 max-w-3xl mx-auto space-y-3">
            <HolidayScopeToggle
              allCountries={allCountries}
              onChange={setAllCountries}
              className="[&_button]:text-white/80 [&_button]:border-white/10 [&_span]:text-white/50"
            />
            <HolidayFilterToggle
              publicOnly={publicOnly}
              onChange={setPublicOnly}
              className="[&_button]:text-white/80 [&_button]:border-white/10"
            />
          </div>

          {/* Theme filter chips */}
          {showFilters && (
            <div className="flex flex-wrap gap-1.5 px-4 mt-3 max-w-3xl mx-auto animate-in">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setThemeFilter(opt.value)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    themeFilter === opt.value
                      ? 'border-amber-400/50 bg-amber-400/15 text-amber-200'
                      : 'border-white/10 bg-white/5 text-white/40 hover:text-white/60 hover:border-white/20'
                  }`}
                >
                  {t(opt.labelKey, { defaultValue: opt.labelKey.split('.').pop() })}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 px-4 pb-12 max-w-4xl mx-auto w-full space-y-10">
          {/* Upcoming section */}
          <section>
            <h2 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              {t('holidaysPage.upcomingTitle')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcoming.map((h) => (
                <HolidayCard
                  key={h.definition.id}
                  holiday={h}
                  locale={locale}
                  onCountDown={handleCountDown}
                />
              ))}
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-white/5" />

          {/* All holidays by month */}
          <section>
            <h2 className="text-lg font-semibold text-white/80 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-white/40" />
              {t('holidaysPage.allTitle', { year: currentYear })}
              <span className="text-sm font-normal text-white/30 ml-1">
                ({filtered.length})
              </span>
            </h2>

            {filtered.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">{t('holidaysPage.noResults')}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                  const holidays = groupedByMonth[month];
                  if (!holidays?.length) return null;

                  if (showWorldwideGrouping) {
                    const { worldwide, regional } = partitionHolidaysByWorldwide(holidays);
                    return (
                      <div key={month} className="space-y-4">
                        <div className="sticky top-[180px] z-20">
                          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-white/5 border border-white/10 text-white/60 backdrop-blur-sm">
                            {t(MONTH_KEYS[month - 1]!, { defaultValue: `Month ${month}` })}
                          </span>
                        </div>
                        <MonthSubsection
                          label={t('holidaySelector.groupWorldwide', {
                            defaultValue: 'Worldwide celebrations',
                          })}
                          showGlobe
                          holidays={worldwide}
                          locale={locale}
                          onCountDown={handleCountDown}
                        />
                        <MonthSubsection
                          label={t('holidaySelector.groupNearYou', {
                            defaultValue: 'Near you',
                          })}
                          holidays={regional}
                          locale={locale}
                          onCountDown={handleCountDown}
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={month}>
                      <div className="sticky top-[180px] z-20 mb-3">
                        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-white/5 border border-white/10 text-white/60 backdrop-blur-sm">
                          {t(MONTH_KEYS[month - 1]!, { defaultValue: `Month ${month}` })}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {holidays.map((h) => (
                          <HolidayCard
                            key={h.definition.id}
                            holiday={h}
                            locale={locale}
                            compact
                            onCountDown={handleCountDown}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
