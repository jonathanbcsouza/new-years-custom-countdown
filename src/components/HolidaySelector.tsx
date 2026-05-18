import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Search, ChevronDown, X, Sparkles, Globe } from 'lucide-react';
import {
  listSelectableHolidays,
  resolveNextHoliday,
  resolveHolidayById,
  isWorldwideHolidayDefinition,
} from '@/lib/holidays';
import { getPrimaryCountryCodeForTimezone } from '@/lib/timezoneCountry';
import { usePublicHolidayFilter } from '@/hooks/usePublicHolidayFilter';
import { HolidayFilterToggle } from '@/components/HolidayFilterToggle';
import { cn } from '@/lib/utils';
import type { ResolvedHoliday } from '@/lib/holidays';

interface HolidaySelectorProps {
  timezone: string;
  selectedHolidayId: string | null;
  onChange: (holidayId: string | null) => void;
  className?: string;
}

function formatHolidayDate(
  ymd: { year: number; month: number; day: number },
  locale: string,
): string {
  const d = new Date(ymd.year, ymd.month - 1, ymd.day);
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

function HolidayRow({
  holiday,
  name,
  locale,
  isSelected,
  onSelect,
}: {
  holiday: ResolvedHoliday;
  name: string;
  locale: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(holiday.definition.id)}
      className={cn(
        'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
        isSelected
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground/80 hover:bg-muted',
      )}
    >
      <span className="flex items-center gap-2 truncate">
        <span>{holiday.definition.emoji}</span>
        <span className="truncate">{name}</span>
      </span>
      <span
        className={cn(
          'text-xs shrink-0',
          isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground',
        )}
      >
        {formatHolidayDate(holiday.date, locale)}
      </span>
    </button>
  );
}

function SectionHeader({
  label,
  showGlobe = false,
}: {
  label: string;
  showGlobe?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 px-3 pt-3 pb-1">
      {showGlobe && <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function HolidaySelector({
  timezone,
  selectedHolidayId,
  onChange,
  className,
}: HolidaySelectorProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language ?? 'en';
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { publicOnly, setPublicOnly } = usePublicHolidayFilter();
  const listOptions = useMemo(
    () => (publicOnly ? { publicOnly: true } : undefined),
    [publicOnly],
  );

  const countryCode = useMemo(
    () => getPrimaryCountryCodeForTimezone(timezone),
    [timezone],
  );

  const context = useMemo(
    () => ({ timezone, countryCode }),
    [timezone, countryCode],
  );

  const holidays = useMemo(
    () => listSelectableHolidays(context, new Date(), 50, listOptions),
    [context, listOptions],
  );

  const autoHoliday = useMemo(
    () => resolveNextHoliday(context, new Date(), listOptions),
    [context, listOptions],
  );

  const selectedHoliday = useMemo(() => {
    if (!selectedHolidayId) return null;
    const fromList = holidays.find((h) => h.definition.id === selectedHolidayId);
    if (fromList) return fromList;
    return resolveHolidayById(selectedHolidayId, context, new Date());
  }, [holidays, selectedHolidayId, context]);

  const getName = useCallback(
    (h: ResolvedHoliday) =>
      t(h.definition.nameKey, {
        defaultValue: h.definition.nameKey.split('.').pop(),
      }),
    [t],
  );

  const filteredHolidays = useMemo(() => {
    if (!searchQuery.trim()) return holidays;
    const q = searchQuery.trim().toLowerCase();
    return holidays.filter((h) => {
      const name = getName(h).toLowerCase();
      return name.includes(q) || h.definition.emoji.includes(q);
    });
  }, [holidays, searchQuery, getName]);

  const isSearching = searchQuery.trim().length > 0;

  const { worldwideHolidays, regionalHolidays } = useMemo(() => {
    const worldwide: ResolvedHoliday[] = [];
    const regional: ResolvedHoliday[] = [];
    for (const h of filteredHolidays) {
      if (isWorldwideHolidayDefinition(h.definition)) {
        worldwide.push(h);
      } else {
        regional.push(h);
      }
    }
    return { worldwideHolidays: worldwide, regionalHolidays: regional };
  }, [filteredHolidays]);

  const handleSelect = useCallback(
    (holidayId: string | null) => {
      onChange(holidayId);
      setIsOpen(false);
      setSearchQuery('');
    },
    [onChange],
  );

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
  }, []);

  const triggerLabel = useMemo(() => {
    if (selectedHoliday) {
      return `${selectedHoliday.definition.emoji} ${getName(selectedHoliday)}`;
    }
    if (autoHoliday) {
      const autoName = getName(autoHoliday);
      return t('holidaySelector.autoWithName', {
        name: autoName,
        defaultValue: `Auto: ${autoName}`,
      });
    }
    return t('holidaySelector.auto', { defaultValue: 'Auto (next holiday)' });
  }, [selectedHoliday, autoHoliday, getName, t]);

  const renderHolidayRows = (list: ResolvedHoliday[]) =>
    list.map((h) => (
      <HolidayRow
        key={h.definition.id}
        holiday={h}
        name={getName(h)}
        locale={locale}
        isSelected={selectedHolidayId === h.definition.id}
        onSelect={(id) => handleSelect(id)}
      />
    ));

  const renderHolidayList = () => {
    if (filteredHolidays.length === 0) {
      return (
        <div className="px-4 py-6 text-center text-muted-foreground">
          <p className="text-sm">
            {t('holidaySelector.noResults', {
              defaultValue: 'No holidays found',
            })}
          </p>
        </div>
      );
    }

    if (isSearching) {
      return renderHolidayRows(filteredHolidays);
    }

    return (
      <>
        {worldwideHolidays.length > 0 && (
          <>
            <SectionHeader
              label={t('holidaySelector.groupWorldwide', {
                defaultValue: 'Worldwide celebrations',
              })}
              showGlobe
            />
            {renderHolidayRows(worldwideHolidays)}
          </>
        )}
        {regionalHolidays.length > 0 && (
          <>
            <SectionHeader
              label={t('holidaySelector.groupNearYou', {
                defaultValue: 'Near you',
              })}
            />
            {renderHolidayRows(regionalHolidays)}
          </>
        )}
      </>
    );
  };

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg
                   bg-white/10 backdrop-blur-sm border border-white/20
                   text-white hover:bg-white/20 transition-all
                   min-w-[200px] md:min-w-[280px]"
        title={t('holidaySelector.select', { defaultValue: 'Choose holiday' })}
      >
        <Calendar className="h-4 w-4 text-white/70 shrink-0" />
        <span className="truncate text-sm flex-1 text-left">{triggerLabel}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-white/70 transition-transform shrink-0',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100] bg-black/30"
            onClick={closeDropdown}
            role="presentation"
          />

          <div
            className="absolute top-full right-0 mt-2 z-[110]
                          w-[calc(100vw-2rem)] sm:w-[320px] md:w-[400px] max-h-[70vh]
                          bg-card/95 backdrop-blur-md border border-border
                          rounded-xl shadow-2xl overflow-hidden
                          animate-in fade-in-0 zoom-in-95"
          >
            <div className="sticky top-0 z-10 bg-card border-b border-border p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('holidaySelector.search', {
                    defaultValue: 'Search holidays...',
                  })}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-sm rounded-lg
                             bg-background border border-input
                             focus:outline-none focus:ring-2 focus:ring-ring
                             placeholder:text-muted-foreground"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2
                               p-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
              <div className="mt-2">
                <HolidayFilterToggle
                  publicOnly={publicOnly}
                  onChange={setPublicOnly}
                  compact
                />
              </div>
            </div>

            <div className="max-h-[calc(70vh-60px)] overflow-y-auto p-2">
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors mb-1',
                  selectedHolidayId === null
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/90 hover:bg-muted',
                )}
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                <span className="font-medium">
                  {t('holidaySelector.auto', { defaultValue: 'Auto (next holiday)' })}
                </span>
              </button>

              {renderHolidayList()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
