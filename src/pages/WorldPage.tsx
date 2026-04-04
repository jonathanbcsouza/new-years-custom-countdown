import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Globe,
  PartyPopper,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StarryFireworksBackground } from '@/components/StarryFireworksBackground';
import { LanguageSelector } from '@/components/LanguageSelector';
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
    Math.floor(Date.now() / 60000)
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

      <main className="min-h-screen flex flex-col relative z-10">
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
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

        <div className="flex-1 flex flex-col items-center justify-start pt-20 px-4 pb-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Globe className="h-8 w-8 text-amber-400" />
              <h1 className="text-2xl md:text-4xl font-bold text-white tracking-wide">
                {t('world.title')}
              </h1>
            </div>
            <p className="text-sm md:text-base text-amber-200/70">
              {t('world.subtitle')}
            </p>
          </div>

          <div className="w-full max-w-2xl mb-8">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-amber-200">
                {stats.percentage}% {t('world.celebrating')}
              </span>
              <span className="text-white/50">
                {stats.celebratingCount} / {zones.length} {t('world.cities')}
              </span>
            </div>
            <div className="h-3 bg-slate-800/80 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>

          <div className="w-full max-w-4xl space-y-8">
            {celebrating.length > 0 && (
              <section className="bg-gradient-to-b from-amber-900/20 to-transparent border border-amber-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PartyPopper className="h-6 w-6 text-amber-400" />
                  <h2 className="text-xl font-semibold text-amber-400">
                    {t('global.alreadyCelebrating')} 🎉
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {displayedCelebrating.map((zone) => (
                    <div
                      key={`${zone.country}-${zone.timezone}`}
                      className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl"
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{zone.city}</div>
                        <div className="text-xs text-amber-200/70 truncate">
                          {zone.country}
                          {zone.activeHoliday && (
                            <span className="ml-1">
                              — {zone.activeHoliday.definition.emoji}{' '}
                              {t(zone.activeHoliday.definition.nameKey, {
                                defaultValue: zone.activeHoliday.definition.nameKey.split('.').pop(),
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-amber-300/50 font-mono">
                        UTC{getCelebrationOffsetLabel(zone.timezone)}
                      </div>
                    </div>
                  ))}
                </div>
                {celebrating.length > 12 && (
                  <button
                    onClick={() => setShowAllCelebrating(!showAllCelebrating)}
                    className="mt-4 flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition-colors"
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
              <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-6 w-6 text-slate-400" />
                  <h2 className="text-xl font-semibold text-slate-300">
                    {t('world.stillWaiting')}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {displayedWaiting.map((zone) => (
                    <div
                      key={`${zone.country}-${zone.timezone}`}
                      className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl"
                    >
                      <div className="w-2 h-2 rounded-full bg-slate-500" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-200 truncate">{zone.city}</div>
                        <div className="text-xs text-slate-400 truncate">{zone.country}</div>
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        UTC{getCelebrationOffsetLabel(zone.timezone)}
                      </div>
                    </div>
                  ))}
                </div>
                {waiting.length > 12 && (
                  <button
                    onClick={() => setShowAllWaiting(!showAllWaiting)}
                    className="mt-4 flex items-center gap-1 text-sm text-slate-400 hover:text-slate-300 transition-colors"
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
        </div>
      </main>
    </>
  );
}
