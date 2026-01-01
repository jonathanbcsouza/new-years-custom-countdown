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
import { isNewYearInTimezone } from '@/lib/geolocation';

// Major cities/countries with their timezones for the celebration tracker
const CELEBRATION_ZONES = [
  // UTC+14 to UTC+12 - First to celebrate
  { city: 'Kiritimati', country: 'Kiribati', timezone: 'Pacific/Kiritimati', offset: '+14' },
  { city: 'Apia', country: 'Samoa', timezone: 'Pacific/Apia', offset: '+13' },
  { city: 'Auckland', country: 'New Zealand', timezone: 'Pacific/Auckland', offset: '+13' },
  { city: 'Suva', country: 'Fiji', timezone: 'Pacific/Fiji', offset: '+12' },

  // UTC+11 to UTC+10
  { city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', offset: '+11' },
  { city: 'Melbourne', country: 'Australia', timezone: 'Australia/Melbourne', offset: '+11' },
  { city: 'Brisbane', country: 'Australia', timezone: 'Australia/Brisbane', offset: '+10' },

  // UTC+9 to UTC+8
  { city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', offset: '+9' },
  { city: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul', offset: '+9' },
  { city: 'Beijing', country: 'China', timezone: 'Asia/Shanghai', offset: '+8' },
  { city: 'Hong Kong', country: 'Hong Kong', timezone: 'Asia/Hong_Kong', offset: '+8' },
  { city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', offset: '+8' },
  { city: 'Perth', country: 'Australia', timezone: 'Australia/Perth', offset: '+8' },

  // UTC+7 to UTC+5:30
  { city: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok', offset: '+7' },
  { city: 'Jakarta', country: 'Indonesia', timezone: 'Asia/Jakarta', offset: '+7' },
  { city: 'Ho Chi Minh City', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh', offset: '+7' },
  { city: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata', offset: '+5:30' },
  { city: 'New Delhi', country: 'India', timezone: 'Asia/Kolkata', offset: '+5:30' },

  // UTC+5 to UTC+3
  { city: 'Karachi', country: 'Pakistan', timezone: 'Asia/Karachi', offset: '+5' },
  { city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai', offset: '+4' },
  { city: 'Moscow', country: 'Russia', timezone: 'Europe/Moscow', offset: '+3' },
  { city: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul', offset: '+3' },
  { city: 'Nairobi', country: 'Kenya', timezone: 'Africa/Nairobi', offset: '+3' },

  // UTC+2 to UTC+1
  { city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', offset: '+2' },
  { city: 'Johannesburg', country: 'South Africa', timezone: 'Africa/Johannesburg', offset: '+2' },
  { city: 'Athens', country: 'Greece', timezone: 'Europe/Athens', offset: '+2' },
  { city: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin', offset: '+1' },
  { city: 'Paris', country: 'France', timezone: 'Europe/Paris', offset: '+1' },
  { city: 'Rome', country: 'Italy', timezone: 'Europe/Rome', offset: '+1' },
  { city: 'Madrid', country: 'Spain', timezone: 'Europe/Madrid', offset: '+1' },
  { city: 'Amsterdam', country: 'Netherlands', timezone: 'Europe/Amsterdam', offset: '+1' },

  // UTC+0
  { city: 'London', country: 'UK', timezone: 'Europe/London', offset: '+0' },
  { city: 'Lisbon', country: 'Portugal', timezone: 'Europe/Lisbon', offset: '+0' },
  { city: 'Casablanca', country: 'Morocco', timezone: 'Africa/Casablanca', offset: '+0' },
  { city: 'Accra', country: 'Ghana', timezone: 'Africa/Accra', offset: '+0' },

  // UTC-1 to UTC-3
  { city: 'São Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo', offset: '-3' },
  { city: 'Rio de Janeiro', country: 'Brazil', timezone: 'America/Sao_Paulo', offset: '-3' },
  { city: 'Buenos Aires', country: 'Argentina', timezone: 'America/Argentina/Buenos_Aires', offset: '-3' },

  // UTC-4 to UTC-5
  { city: 'Santiago', country: 'Chile', timezone: 'America/Santiago', offset: '-3' },
  { city: 'New York', country: 'USA', timezone: 'America/New_York', offset: '-5' },
  { city: 'Toronto', country: 'Canada', timezone: 'America/Toronto', offset: '-5' },
  { city: 'Miami', country: 'USA', timezone: 'America/New_York', offset: '-5' },
  { city: 'Bogotá', country: 'Colombia', timezone: 'America/Bogota', offset: '-5' },

  // UTC-6 to UTC-7
  { city: 'Mexico City', country: 'Mexico', timezone: 'America/Mexico_City', offset: '-6' },
  { city: 'Chicago', country: 'USA', timezone: 'America/Chicago', offset: '-6' },
  { city: 'Denver', country: 'USA', timezone: 'America/Denver', offset: '-7' },
  { city: 'Phoenix', country: 'USA', timezone: 'America/Phoenix', offset: '-7' },

  // UTC-8 to UTC-10
  { city: 'Los Angeles', country: 'USA', timezone: 'America/Los_Angeles', offset: '-8' },
  { city: 'San Francisco', country: 'USA', timezone: 'America/Los_Angeles', offset: '-8' },
  { city: 'Vancouver', country: 'Canada', timezone: 'America/Vancouver', offset: '-8' },
  { city: 'Anchorage', country: 'USA', timezone: 'America/Anchorage', offset: '-9' },
  { city: 'Honolulu', country: 'USA', timezone: 'Pacific/Honolulu', offset: '-10' },

  // UTC-11 - Last to celebrate
  { city: 'Pago Pago', country: 'American Samoa', timezone: 'Pacific/Pago_Pago', offset: '-11' },
];

/**
 * World Page - Full page view showing global New Year celebration status
 */
export function WorldPage() {
  const { t } = useTranslation();
  const [showAllCelebrating, setShowAllCelebrating] = useState(false);
  const [showAllWaiting, setShowAllWaiting] = useState(false);

  // State to force re-evaluation every minute
  const [currentMinute, setCurrentMinute] = useState(() =>
    Math.floor(Date.now() / 60000)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMinute(Math.floor(Date.now() / 60000));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Categorize zones by celebration status
  const { celebrating, waiting, stats } = useMemo(() => {
    const celebrating: typeof CELEBRATION_ZONES = [];
    const waiting: typeof CELEBRATION_ZONES = [];

    CELEBRATION_ZONES.forEach((zone) => {
      const isCelebrating = isNewYearInTimezone(zone.timezone);
      if (isCelebrating) {
        celebrating.push(zone);
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
        percentage: Math.round(
          (celebrating.length / CELEBRATION_ZONES.length) * 100
        ),
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMinute]);

  const displayedCelebrating = showAllCelebrating
    ? celebrating
    : celebrating.slice(0, 12);
  const displayedWaiting = showAllWaiting ? waiting : waiting.slice(0, 12);

  return (
    <>
      {/* Background */}
      <StarryFireworksBackground celebrationMode={celebrating.length > 0} />

      {/* Main Layout */}
      <main className="min-h-screen flex flex-col relative z-10">
        {/* Top Bar */}
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

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-start pt-20 px-4 pb-8">
          {/* Header */}
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

          {/* Progress Bar */}
          <div className="w-full max-w-2xl mb-8">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-amber-200">
                {stats.percentage}% {t('world.celebrating')}
              </span>
              <span className="text-white/50">
                {stats.celebratingCount} / {CELEBRATION_ZONES.length}{' '}
                {t('world.cities')}
              </span>
            </div>
            <div className="h-3 bg-slate-800/80 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="w-full max-w-4xl space-y-8">
            {/* Celebrating Section */}
            {celebrating.length > 0 && (
              <section className="bg-gradient-to-b from-amber-900/20 to-transparent border border-amber-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PartyPopper className="h-6 w-6 text-amber-400" />
                  <h2 className="text-xl font-semibold text-amber-400">
                    {t('world.alreadyCelebrating')} 🎉
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {displayedCelebrating.map((zone) => (
                    <div
                      key={`${zone.city}-${zone.timezone}`}
                      className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl"
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">
                          {zone.city}
                        </div>
                        <div className="text-xs text-amber-200/70 truncate">
                          {zone.country}
                        </div>
                      </div>
                      <div className="text-xs text-amber-300/50 font-mono">
                        UTC{zone.offset}
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

            {/* Waiting Section */}
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
                      key={`${zone.city}-${zone.timezone}`}
                      className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl"
                    >
                      <div className="w-2 h-2 rounded-full bg-slate-500" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-200 truncate">
                          {zone.city}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {zone.country}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        UTC{zone.offset}
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

