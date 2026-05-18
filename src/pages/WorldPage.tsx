import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, PartyPopper, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { StarryFireworksBackground } from '@/components/StarryFireworksBackground';
import { AppShell } from '@/components/AppShell';
import { isCelebrationInTimezone, getActiveCelebration } from '@/lib/geolocation';
import {
  getCelebrationOffsetLabel,
  getCelebrationZonesSortedAt,
  type CelebrationZone,
} from '@/lib/celebrationZones';
import type { ResolvedHoliday } from '@/lib/holidays';

interface ZoneWithHoliday extends CelebrationZone {
  activeHoliday: ResolvedHoliday | null;
}

export function WorldPage() {
  const { t } = useTranslation();
  const [showAllCelebrating, setShowAllCelebrating] = useState(false);
  const [showAllWaiting, setShowAllWaiting] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(() =>
    Math.floor(Date.now() / 60000),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMinute(Math.floor(Date.now() / 60000));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const zones = useMemo(() => {
    void currentMinute;
    return getCelebrationZonesSortedAt(new Date());
  }, [currentMinute]);

  const { celebrating, waiting, stats } = useMemo(() => {
    const celebrating: ZoneWithHoliday[] = [];
    const waiting: CelebrationZone[] = [];

    zones.forEach((zone) => {
      if (isCelebrationInTimezone(zone.timezone, zone.countryCode)) {
        const activeHoliday = getActiveCelebration(zone.timezone, zone.countryCode);
        celebrating.push({ ...zone, activeHoliday });
      } else {
        waiting.push(zone);
      }
    });

    return {
      celebrating,
      waiting,
      stats: {
        celebratingCount: celebrating.length,
        waitingCount: waiting.length,
        percentage: Math.round((celebrating.length / zones.length) * 100),
      },
    };
  }, [zones]);

  const displayedCelebrating = showAllCelebrating ? celebrating : celebrating.slice(0, 12);
  const displayedWaiting = showAllWaiting ? waiting : waiting.slice(0, 12);

  return (
    <>
      <StarryFireworksBackground celebrationMode={celebrating.length > 0} />

      <AppShell contentClassName="items-center px-4 pb-8">
        <div className="text-center mb-8 w-full max-w-2xl">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Globe className="h-8 w-8 text-brand" />
            <h1 className="page-title">{t('world.title')}</h1>
          </div>
          <p className="text-sm md:text-base text-app-secondary">{t('world.subtitle')}</p>
        </div>

        <div className="w-full max-w-2xl mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-brand">{stats.percentage}% {t('world.celebrating')}</span>
            <span className="text-app-muted">
              {stats.celebratingCount} / {zones.length} {t('world.cities')}
            </span>
          </div>
          <div className="h-3 bg-[hsl(var(--inactive))]/80 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-brand to-brand/70 transition-all duration-1000"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>

        <div className="w-full max-w-4xl space-y-8">
          {celebrating.length > 0 && (
            <section className="bg-gradient-to-b from-brand/10 to-transparent border border-brand/25 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <PartyPopper className="h-6 w-6 text-brand" />
                <h2 className="text-xl font-semibold text-brand">
                  {t('global.alreadyCelebrating')}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayedCelebrating.map((zone) => (
                  <div
                    key={`${zone.country}-${zone.timezone}`}
                    className="flex items-center gap-3 px-4 py-3 bg-brand/10 border border-brand/20 rounded-xl"
                  >
                    <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{zone.city}</div>
                      <div className="text-xs text-app-secondary truncate">
                        {zone.country}
                        {zone.activeHoliday && (
                          <span className="ml-1">
                            — {zone.activeHoliday.definition.emoji}{' '}
                            {t(zone.activeHoliday.definition.nameKey, {
                              defaultValue: zone.activeHoliday.definition.nameKey
                                .split('.')
                                .pop(),
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-app-muted font-mono">
                      UTC{getCelebrationOffsetLabel(zone.timezone)}
                    </div>
                  </div>
                ))}
              </div>
              {celebrating.length > 12 && (
                <button
                  type="button"
                  onClick={() => setShowAllCelebrating(!showAllCelebrating)}
                  className="mt-4 flex items-center gap-1 text-sm text-brand hover:text-brand/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-2 py-1"
                >
                  {showAllCelebrating ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      {t('world.showLess')}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      {t('world.showMore', { count: celebrating.length - 12 })}
                    </>
                  )}
                </button>
              )}
            </section>
          )}

          {waiting.length > 0 && (
            <section className="bg-[hsl(var(--inactive))]/30 border border-[hsl(var(--inactive))]/50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-6 w-6 text-app-muted" />
                <h2 className="text-xl font-semibold text-app-secondary">
                  {t('world.stillWaiting')}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayedWaiting.map((zone) => (
                  <div
                    key={`${zone.country}-${zone.timezone}`}
                    className="flex items-center gap-3 px-4 py-3 bg-[hsl(var(--inactive))]/50 border border-[hsl(var(--inactive))]/60 rounded-xl"
                  >
                    <div className="w-2 h-2 rounded-full bg-app-muted" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground/90 truncate">{zone.city}</div>
                      <div className="text-xs text-app-muted truncate">{zone.country}</div>
                    </div>
                    <div className="text-xs text-app-muted font-mono">
                      UTC{getCelebrationOffsetLabel(zone.timezone)}
                    </div>
                  </div>
                ))}
              </div>
              {waiting.length > 12 && (
                <button
                  type="button"
                  onClick={() => setShowAllWaiting(!showAllWaiting)}
                  className="mt-4 flex items-center gap-1 text-sm text-app-muted hover:text-app-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-2 py-1"
                >
                  {showAllWaiting ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      {t('world.showLess')}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      {t('world.showMore', { count: waiting.length - 12 })}
                    </>
                  )}
                </button>
              )}
            </section>
          )}
        </div>
      </AppShell>
    </>
  );
}
