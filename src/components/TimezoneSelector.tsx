import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Globe,
  Search,
  ChevronDown,
  ChevronRight,
  X,
  PartyPopper,
} from 'lucide-react';
import {
  getGroupedTimezones,
  formatTimezone,
  type ContinentGroup,
} from '@/lib/timezones';
import { isNewYearInTimezone } from '@/lib/geolocation';
import { cn } from '@/lib/utils';

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
  className?: string;
}

/**
 * Enhanced timezone selector with continent → country → city hierarchy
 * Searchable by city, country, or continent name
 */
export function TimezoneSelector({
  value,
  onChange,
  className,
}: TimezoneSelectorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedContinents, setExpandedContinents] = useState<Set<string>>(
    new Set()
  );
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(
    new Set()
  );

  const groupedTimezones = useMemo(() => getGroupedTimezones(), []);

  // Filter timezones based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return groupedTimezones;
    }

    const query = searchQuery.toLowerCase();
    const result: ContinentGroup[] = [];

    groupedTimezones.forEach((continentGroup) => {
      const matchingCountries = continentGroup.countries
        .map((countryGroup) => {
          // Check if country matches
          const countryMatches = countryGroup.country
            .toLowerCase()
            .includes(query);

          // Filter cities
          const matchingTimezones = countryGroup.timezones.filter((tz) =>
            tz.searchText.includes(query)
          );

          // Include country if it matches or has matching cities
          if (countryMatches || matchingTimezones.length > 0) {
            return {
              ...countryGroup,
              timezones: countryMatches
                ? countryGroup.timezones
                : matchingTimezones,
            };
          }
          return null;
        })
        .filter(Boolean) as typeof continentGroup.countries;

      // Check if continent matches
      const continentMatches =
        continentGroup.continent.toLowerCase().includes(query) ||
        continentGroup.continentLabel.toLowerCase().includes(query);

      if (continentMatches || matchingCountries.length > 0) {
        result.push({
          ...continentGroup,
          countries: continentMatches
            ? continentGroup.countries
            : matchingCountries,
        });
      }
    });

    return result;
  }, [groupedTimezones, searchQuery]);

  // Auto-expand when searching
  const effectiveExpandedContinents = useMemo(() => {
    if (searchQuery.trim()) {
      return new Set(filteredGroups.map((g) => g.continent));
    }
    return expandedContinents;
  }, [searchQuery, filteredGroups, expandedContinents]);

  const effectiveExpandedCountries = useMemo(() => {
    if (searchQuery.trim()) {
      const countries = new Set<string>();
      filteredGroups.forEach((g) => {
        g.countries.forEach((c) => {
          countries.add(`${g.continent}/${c.country}`);
        });
      });
      return countries;
    }
    return expandedCountries;
  }, [searchQuery, filteredGroups, expandedCountries]);

  const toggleContinent = useCallback((continent: string) => {
    setExpandedContinents((prev) => {
      const next = new Set(prev);
      if (next.has(continent)) {
        next.delete(continent);
      } else {
        next.add(continent);
      }
      return next;
    });
  }, []);

  const toggleCountry = useCallback((key: string) => {
    setExpandedCountries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (timezone: string) => {
      onChange(timezone);
      setIsOpen(false);
      setSearchQuery('');
    },
    [onChange]
  );

  const currentLabel = formatTimezone(value);

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg
                   bg-white/10 backdrop-blur-sm border border-white/20
                   text-white hover:bg-white/20 transition-all
                   min-w-[200px] md:min-w-[280px]"
      >
        <Globe className="h-4 w-4 text-white/70 shrink-0" />
        <span className="truncate text-sm flex-1 text-left">
          {currentLabel}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-white/70 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setSearchQuery('');
            }}
          />

          {/* Dropdown Content */}
          <div
            className="absolute top-full right-0 mt-2 z-50
                          w-[calc(100vw-2rem)] sm:w-[320px] md:w-[400px] max-h-[70vh]
                          bg-card/95 backdrop-blur-md border border-border
                          rounded-xl shadow-2xl overflow-hidden
                          animate-in fade-in-0 zoom-in-95"
          >
            {/* Search Input */}
            <div className="sticky top-0 z-10 bg-card border-b border-border p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('timezone.search')}
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
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 
                               p-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* Timezone List */}
            <div className="max-h-[calc(70vh-60px)] overflow-y-auto p-2">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((continentGroup) => (
                  <div key={continentGroup.continent} className="mb-1">
                    {/* Continent Header */}
                    <button
                      onClick={() => toggleContinent(continentGroup.continent)}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg
                                 text-sm font-semibold text-foreground
                                 hover:bg-muted/50 transition-colors"
                    >
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 text-muted-foreground transition-transform',
                          effectiveExpandedContinents.has(
                            continentGroup.continent
                          ) && 'rotate-90'
                        )}
                      />
                      <span>{continentGroup.continentLabel}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {continentGroup.countries.reduce(
                          (acc, c) => acc + c.timezones.length,
                          0
                        )}{' '}
                        {t('timezone.zones')}
                      </span>
                    </button>

                    {/* Countries */}
                    {effectiveExpandedContinents.has(
                      continentGroup.continent
                    ) && (
                      <div className="ml-4 border-l border-border/50 pl-2">
                        {continentGroup.countries.map((countryGroup) => {
                          const countryKey = `${continentGroup.continent}/${countryGroup.country}`;
                          const isCountryExpanded =
                            effectiveExpandedCountries.has(countryKey);

                          return (
                            <div key={countryKey} className="mb-0.5">
                              {/* Country Header */}
                              <button
                                onClick={() => toggleCountry(countryKey)}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md
                                           text-sm text-foreground/90
                                           hover:bg-muted/50 transition-colors"
                              >
                                <ChevronRight
                                  className={cn(
                                    'h-3 w-3 text-muted-foreground transition-transform',
                                    isCountryExpanded && 'rotate-90'
                                  )}
                                />
                                <span className="font-medium">
                                  {countryGroup.country}
                                </span>
                                <span className="ml-auto text-xs text-muted-foreground">
                                  {countryGroup.timezones.length}
                                </span>
                              </button>

                              {/* Cities */}
                              {isCountryExpanded && (
                                <div className="ml-5 py-1">
                                  {countryGroup.timezones.map((tz) => {
                                    const isCelebrating = isNewYearInTimezone(
                                      tz.value
                                    );
                                    return (
                                      <button
                                        key={tz.value}
                                        onClick={() => handleSelect(tz.value)}
                                        className={cn(
                                          'w-full flex items-center justify-between px-3 py-1.5 rounded-md',
                                          'text-sm transition-colors',
                                          value === tz.value
                                            ? 'bg-primary text-primary-foreground'
                                            : isCelebrating
                                            ? 'text-foreground/80 hover:bg-amber-500/10 bg-amber-500/5'
                                            : 'text-foreground/80 hover:bg-muted'
                                        )}
                                      >
                                        <span className="flex items-center gap-1.5">
                                          {isCelebrating && (
                                            <PartyPopper className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                          )}
                                          {tz.city}
                                        </span>
                                        <span
                                          className={cn(
                                            'text-xs flex items-center gap-1',
                                            value === tz.value
                                              ? 'text-primary-foreground/80'
                                              : isCelebrating
                                              ? 'text-amber-500'
                                              : 'text-muted-foreground'
                                          )}
                                        >
                                          {isCelebrating && (
                                            <span className="text-[10px] font-medium">
                                              {t('timezone.celebrating')}
                                            </span>
                                          )}
                                          {tz.offset}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  <p className="text-sm">{t('timezone.noResults')}</p>
                  <p className="text-xs mt-1">{t('timezone.searchHint')}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
