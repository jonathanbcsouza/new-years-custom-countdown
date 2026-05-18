import { memo, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, X } from 'lucide-react';
import { useShowSecondaryCountdown } from '@/hooks/useShowSecondaryCountdown';
import { useCountdown } from '@/hooks/useCountdown';
import { useCelebrationAudio } from '@/hooks/useCelebrationAudio';
import { StarryFireworksBackground } from '@/components/StarryFireworksBackground';
import { HolidayDecorations } from '@/components/HolidayDecorations';
import { PhotoCarousel } from '@/components/PhotoCarousel';
import { PhotoUpload } from '@/components/PhotoUpload';
import { TimezoneSelector } from '@/components/TimezoneSelector';
import { HolidaySelector } from '@/components/HolidaySelector';
import { FullscreenButton } from '@/components/FullscreenButton';
import { LanguageSelector } from '@/components/LanguageSelector';
import { DonateButton } from '@/components/DonateButton';
import { SoundToggleButton } from '@/components/SoundToggleButton';
import { GlobalCelebrationsButton } from '@/components/GlobalCelebrations';
import { Button } from '@/components/ui/button';
import { getTheme } from '@/lib/holidays/themes';
import type { ResolvedHoliday } from '@/lib/holidays';
import type { SecondaryCelebration } from '@/lib/geolocation';

interface CountdownProps {
  targetDate: Date;
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  isCelebrationPeriod: boolean;
  holiday: ResolvedHoliday | null;
  secondaryHolidays?: SecondaryCelebration[];
  selectedHolidayId: string | null;
  onHolidayChange: (holidayId: string | null) => void;
}

const formatNumber = (num: number): string => String(num).padStart(2, '0');

function formatYmd(ymd: { year: number; month: number; day: number }, locale: string, includeYear = true): string {
  const d = new Date(ymd.year, ymd.month - 1, ymd.day);
  const opts: Intl.DateTimeFormatOptions = includeYear
    ? { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
    : { weekday: 'short', month: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat(locale, opts).format(d);
}

function formatObservedDate(ymd: { year: number; month: number; day: number }, locale: string): string {
  const d = new Date(ymd.year, ymd.month - 1, ymd.day);
  return new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'short', day: 'numeric' }).format(d);
}

function ObservedDateNote({ holiday, locale }: { holiday: ResolvedHoliday; locale: string }) {
  const { t } = useTranslation();
  if (!holiday.observedDate) return null;
  const formatted = formatObservedDate(holiday.observedDate, locale);
  return (
    <p className="text-center text-xs text-amber-300/70 mt-1 italic">
      {t('countdown.publicHolidayOn', { date: formatted, defaultValue: `Public holiday on ${formatted}` })}
    </p>
  );
}

function HolidaysPageButton() {
  const { t } = useTranslation();
  return (
    <Link to="/holidays">
      <Button
        variant="ghost"
        size="sm"
        className="text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 transition-all gap-1.5 group"
        title={t('holidaysPage.buttonTooltip')}
      >
        <Calendar className="h-4 w-4 group-hover:animate-pulse" />
        <span className="text-xs hidden sm:inline">{t('holidaysPage.button')}</span>
      </Button>
    </Link>
  );
}

function SecondaryCountdownCard({ entry, locale }: { entry: SecondaryCelebration; locale: string }) {
  const { t } = useTranslation();
  const { days, hours, minutes, seconds } = useCountdown(entry.targetDate);
  const theme = getTheme(entry.holiday.definition.theme);
  const name = t(entry.holiday.definition.nameKey, {
    defaultValue: entry.holiday.definition.nameKey.split('.').pop(),
  });

  return (
    <div
      className="animate-slide-up rounded-xl px-4 py-3 md:px-6 md:py-4 backdrop-blur-sm border border-white/10"
      style={{
        background: theme.gradient,
        boxShadow: '0 2px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs md:text-sm font-semibold text-white/90 uppercase tracking-wider truncate">
          {entry.holiday.definition.emoji} {name}
        </span>
        <span className="text-[10px] md:text-xs text-white/50 whitespace-nowrap">
          {formatYmd(entry.holiday.date, locale, false)}
        </span>
      </div>
      <div className="flex items-center justify-center gap-1">
        <span className="text-lg md:text-2xl lg:text-3xl font-bold text-white tabular-nums text-glow">
          {formatNumber(days)}
        </span>
        <span className="text-lg md:text-2xl lg:text-3xl font-light text-white/60">:</span>
        <span className="text-lg md:text-2xl lg:text-3xl font-bold text-white tabular-nums text-glow">
          {formatNumber(hours)}
        </span>
        <span className="text-lg md:text-2xl lg:text-3xl font-light text-white/60">:</span>
        <span className="text-lg md:text-2xl lg:text-3xl font-bold text-white tabular-nums text-glow">
          {formatNumber(minutes)}
        </span>
        <span className="text-lg md:text-2xl lg:text-3xl font-light text-white/60">:</span>
        <span className="text-lg md:text-2xl lg:text-3xl font-bold text-white tabular-nums text-glow">
          {formatNumber(seconds)}
        </span>
      </div>
      <ObservedDateNote holiday={entry.holiday} locale={locale} />
    </div>
  );
}

export const Countdown = memo(function Countdown({
  targetDate,
  timezone,
  onTimezoneChange,
  photos,
  onPhotosChange,
  isCelebrationPeriod,
  holiday,
  secondaryHolidays = [],
  selectedHolidayId,
  onHolidayChange,
}: CountdownProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language ?? 'en';
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showFireworkHint, setShowFireworkHint] = useState(true);
  const { showSecondary, setShowSecondary } = useShowSecondaryCountdown();
  const { days, hours, minutes, seconds, isComplete } = useCountdown(targetDate);

  const showCelebration = isCelebrationPeriod || isComplete;

  useEffect(() => {
    const timer = setTimeout(() => setShowFireworkHint(false), 15000);
    return () => clearTimeout(timer);
  }, []);

  const { isSoundEnabled, isPlaying, toggleSound } = useCelebrationAudio(showCelebration);

  const themeVariant = holiday?.definition.theme ?? 'default';
  const theme = useMemo(() => getTheme(themeVariant), [themeVariant]);

  const holidayName = holiday
    ? t(holiday.definition.nameKey, { defaultValue: holiday.definition.nameKey.split('.').pop() })
    : t('countdown.title');

  const holidayEmoji = holiday?.definition.emoji ?? '🎉';

  const countdownTitle = showCelebration
    ? holiday
      ? t('countdown.happyCelebration', { name: holidayName, defaultValue: `Happy ${holidayName}!` })
      : t('countdown.happyNewYear')
    : holiday
      ? t('countdown.countingDownTo', { name: holidayName, defaultValue: `${holidayName} Countdown` })
      : t('countdown.title');

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', theme.accentHsl);
    root.style.setProperty('--accent-foreground', theme.accentForegroundHsl);
    root.style.setProperty('--ring', theme.accentHsl);
    document.body.style.background = theme.bodyGradient;
    return () => {
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-foreground');
      root.style.removeProperty('--ring');
      document.body.style.background = '';
    };
  }, [theme]);

  return (
    <>
      <StarryFireworksBackground celebrationMode={showCelebration} />
      <HolidayDecorations variant={themeVariant} />

      {showPhotoUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in">
          <PhotoUpload
            photos={photos}
            onPhotosChange={onPhotosChange}
            maxPhotos={10}
            onClose={() => setShowPhotoUpload(false)}
          />
        </div>
      )}

      <main className="min-h-screen flex flex-col relative z-10">
        {/* Left controls */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-1">
          <FullscreenButton />
          <LanguageSelector />
          <SoundToggleButton
            isSoundEnabled={isSoundEnabled}
            isPlaying={isPlaying}
            onToggle={toggleSound}
          />
        </div>

        {/* Right controls */}
        <div className="absolute top-3 right-3 z-30 flex flex-col items-end gap-1">
          <HolidaySelector
            timezone={timezone}
            selectedHolidayId={selectedHolidayId}
            onChange={onHolidayChange}
          />
          <TimezoneSelector value={timezone} onChange={onTimezoneChange} />
          <DonateButton />
          <GlobalCelebrationsButton />
          <HolidaysPageButton />
          {showFireworkHint && (
            <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-white/50">
              <Sparkles className="h-3 w-3 text-amber-400/60" />
              <span>{t('fireworks.tapHint')}</span>
            </div>
          )}
        </div>

        {/* Main content */}
        <div
          className={`flex-1 flex flex-col items-center px-4 z-10 ${
            photos.length > 0
              ? 'justify-start pt-20 md:pt-24'
              : 'justify-center pb-24'
          }`}
        >
          {/* Primary holiday title */}
          <h1 className="text-xl md:text-3xl lg:text-4xl font-semibold text-white tracking-widest text-glow mb-6 md:mb-10 text-center uppercase">
            {countdownTitle}
          </h1>

          {!showCelebration ? (
            <div className="w-full max-w-3xl mx-auto space-y-5">
              {/* Primary countdown timer */}
              <div
                className="rounded-lg md:rounded-xl px-6 py-4 md:px-10 md:py-6 animate-glow"
                role="timer"
                aria-label={t('countdown.timeRemaining')}
                style={{
                  background: theme.gradient,
                  boxShadow:
                    '0 4px 30px rgba(255, 220, 150, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                }}
              >
                <div className="flex items-center justify-center">
                  <span className="text-3xl md:text-5xl lg:text-7xl font-bold text-white tabular-nums text-glow tracking-tight">
                    {formatNumber(days)}
                  </span>
                  <span className="text-3xl md:text-5xl lg:text-7xl font-light text-white/70 mx-1 md:mx-2">:</span>
                  <span className="text-3xl md:text-5xl lg:text-7xl font-bold text-white tabular-nums text-glow tracking-tight">
                    {formatNumber(hours)}
                  </span>
                  <span className="text-3xl md:text-5xl lg:text-7xl font-light text-white/70 mx-1 md:mx-2">:</span>
                  <span className="text-3xl md:text-5xl lg:text-7xl font-bold text-white tabular-nums text-glow tracking-tight">
                    {formatNumber(minutes)}
                  </span>
                  <span className="text-3xl md:text-5xl lg:text-7xl font-light text-white/70 mx-1 md:mx-2">:</span>
                  <span className="text-3xl md:text-5xl lg:text-7xl font-bold text-white tabular-nums text-glow tracking-tight">
                    {formatNumber(seconds)}
                  </span>
                </div>
              </div>

              {holiday && (
                <div>
                  <p className="text-center text-sm text-white/50">
                    {holiday.definition.emoji} {holidayName} — {formatYmd(holiday.date, locale)}
                  </p>
                  <ObservedDateNote holiday={holiday} locale={locale} />
                </div>
              )}

              {secondaryHolidays.length > 0 && !showSecondary && (
                <button
                  type="button"
                  onClick={() => setShowSecondary(true)}
                  className="block mx-auto text-xs text-white/40 hover:text-white/70 transition-colors underline-offset-2 hover:underline"
                >
                  {t('countdown.showSecondary', {
                    defaultValue: 'Show upcoming holidays',
                  })}
                </button>
              )}

              {/* Secondary countdowns — holidays within 7 days */}
              {secondaryHolidays.length > 0 && showSecondary && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-xs text-white/40 uppercase tracking-widest">
                      {t('countdown.alsoComingUp', { defaultValue: 'Also coming up' })}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowSecondary(false)}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
                      aria-label={t('countdown.hideSecondary', { defaultValue: 'Hide' })}
                      title={t('countdown.hideSecondary', { defaultValue: 'Hide' })}
                    >
                      <span className="hidden sm:inline">
                        {t('countdown.hideSecondary', { defaultValue: 'Hide' })}
                      </span>
                      <X className="h-3 w-3" aria-hidden />
                    </button>
                  </div>
                  <div className={`grid gap-3 ${
                    secondaryHolidays.length === 1
                      ? 'grid-cols-1 max-w-md mx-auto'
                      : 'grid-cols-1 sm:grid-cols-2'
                  }`}>
                    {secondaryHolidays.map((entry) => (
                      <SecondaryCountdownCard
                        key={entry.holiday.definition.id}
                        entry={entry}
                        locale={locale}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-4xl md:text-6xl text-white animate-float mb-4">
                {holidayEmoji} 🎊 🥂
              </p>
              {isCelebrationPeriod && (
                <p className="text-lg md:text-xl text-white/80">
                  {holiday
                    ? t('countdown.celebratingHoliday', {
                        name: holidayName,
                        defaultValue: `Celebrating ${holidayName}!`,
                      })
                    : t('countdown.celebrating')}
                </p>
              )}
            </div>
          )}
        </div>

        <PhotoCarousel
          photos={photos}
          onAddClick={() => setShowPhotoUpload(true)}
        />
      </main>
    </>
  );
});
