import { memo, useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Globe, PartyPopper, Clock, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface GlobalCelebrationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalCelebrations = memo(function GlobalCelebrations({
  isOpen,
  onClose,
}: GlobalCelebrationsProps) {
  const { t } = useTranslation();
  const [showAllCelebrating, setShowAllCelebrating] = useState(false);
  const [showAllWaiting, setShowAllWaiting] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(() => Math.floor(Date.now() / 60000));

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCurrentMinute(Math.floor(Date.now() / 60000));
    }, 60000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const zones = useMemo(() => {
    void isOpen;
    void currentMinute;
    return getCelebrationZonesSortedAt(new Date());
  }, [isOpen, currentMinute]);

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

  if (!isOpen) return null;

  const displayedCelebrating = showAllCelebrating ? celebrating : celebrating.slice(0, 8);
  const displayedWaiting = showAllWaiting ? waiting : waiting.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[85vh] bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-900/50 to-orange-900/50 border-b border-amber-500/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-amber-400" />
              <div>
                <h2 className="text-xl font-bold text-white">{t('global.title')}</h2>
                <p className="text-sm text-amber-200/70">{t('global.subtitle')}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <X className="h-5 w-5 text-white/70" />
            </button>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-amber-200">
                {stats.percentage}% {t('global.celebrating')}
              </span>
              <span className="text-white/50">
                {stats.celebratingCount} / {zones.length} {t('global.cities')}
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6 space-y-6">
          {celebrating.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <PartyPopper className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-semibold text-amber-400">
                  {t('global.alreadyCelebrating')} 🎉
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {displayedCelebrating.map((zone) => (
                  <div
                    key={`${zone.country}-${zone.timezone}`}
                    className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
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
              {celebrating.length > 8 && (
                <button
                  onClick={() => setShowAllCelebrating(!showAllCelebrating)}
                  className="mt-3 flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                >
                  {showAllCelebrating ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      {t('global.showLess')}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      {t('global.showMore', { count: celebrating.length - 8 })}
                    </>
                  )}
                </button>
              )}
            </section>
          )}

          {waiting.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-300">{t('global.stillWaiting')}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {displayedWaiting.map((zone) => (
                  <div
                    key={`${zone.country}-${zone.timezone}`}
                    className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg"
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
              {waiting.length > 8 && (
                <button
                  onClick={() => setShowAllWaiting(!showAllWaiting)}
                  className="mt-3 flex items-center gap-1 text-sm text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showAllWaiting ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      {t('global.showLess')}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      {t('global.showMore', { count: waiting.length - 8 })}
                    </>
                  )}
                </button>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
});

export const GlobalCelebrationsButton = memo(function GlobalCelebrationsButton() {
  const { t } = useTranslation();
  return (
    <Link to="/world">
      <Button
        variant="ghost"
        size="sm"
        className="text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 transition-all gap-1.5 group"
        title={t('world.buttonTooltip')}
      >
        <Globe className="h-4 w-4 group-hover:animate-pulse" />
        <span className="text-xs hidden sm:inline">{t('world.button')}</span>
      </Button>
    </Link>
  );
});
