import { memo, useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, PartyPopper, Clock, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface GlobalCelebrationsProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Global Celebrations panel showing which countries have already celebrated New Year
 */
export const GlobalCelebrations = memo(function GlobalCelebrations({
  isOpen,
  onClose,
}: GlobalCelebrationsProps) {
  const { t } = useTranslation();
  const [showAllCelebrating, setShowAllCelebrating] = useState(false);
  const [showAllWaiting, setShowAllWaiting] = useState(false);

  // Categorize zones by celebration status
  // Recalculate when modal opens and every minute to keep data fresh
  const [currentMinute, setCurrentMinute] = useState(() => Math.floor(Date.now() / 60000));
  
  useEffect(() => {
    if (!isOpen) return;
    
    // Update every minute to refresh categorization
    const interval = setInterval(() => {
      setCurrentMinute(Math.floor(Date.now() / 60000));
    }, 60000);
    
    return () => clearInterval(interval);
  }, [isOpen]);

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
        percentage: Math.round((celebrating.length / CELEBRATION_ZONES.length) * 100),
      },
    };
  }, [isOpen, currentMinute]);

  if (!isOpen) return null;

  const displayedCelebrating = showAllCelebrating ? celebrating : celebrating.slice(0, 8);
  const displayedWaiting = showAllWaiting ? waiting : waiting.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-900/50 to-orange-900/50 border-b border-amber-500/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-amber-400" />
              <div>
                <h2 className="text-xl font-bold text-white">
                  {t('global.title')}
                </h2>
                <p className="text-sm text-amber-200/70">
                  {t('global.subtitle')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5 text-white/70" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-amber-200">
                {stats.percentage}% {t('global.celebrating')}
              </span>
              <span className="text-white/50">
                {stats.celebratingCount} / {CELEBRATION_ZONES.length} {t('global.cities')}
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

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6 space-y-6">
          {/* Celebrating Section */}
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
                    key={`${zone.city}-${zone.timezone}`}
                    className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
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

          {/* Waiting Section */}
          {waiting.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-300">
                  {t('global.stillWaiting')}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {displayedWaiting.map((zone) => (
                  <div
                    key={`${zone.city}-${zone.timezone}`}
                    className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg"
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

/**
 * Button to open the Global Celebrations panel
 */
export const GlobalCelebrationsButton = memo(function GlobalCelebrationsButton({
  onClick,
}: {
  onClick: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 transition-all gap-1.5 group"
      title={t('global.buttonTooltip')}
    >
      <Globe className="h-4 w-4 group-hover:animate-pulse" />
      <span className="text-xs hidden sm:inline">{t('global.button')}</span>
    </Button>
  );
});

