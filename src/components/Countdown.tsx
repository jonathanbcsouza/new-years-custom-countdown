import { memo, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useShowSecondaryCountdown } from '@/hooks/useShowSecondaryCountdown';
import { useCountdown } from '@/hooks/useCountdown';
import { useCelebrationAudio } from '@/hooks/useCelebrationAudio';
import { useAppTheme } from '@/context/ThemeContext';
import { StarryFireworksBackground } from '@/components/StarryFireworksBackground';
import { HolidayDecorations } from '@/components/HolidayDecorations';
import { PhotoCarousel } from '@/components/PhotoCarousel';
import { PhotoUpload } from '@/components/PhotoUpload';
import { FullscreenButton } from '@/components/FullscreenButton';
import { SoundToggleButton } from '@/components/SoundToggleButton';
import { AppShell } from '@/components/AppShell';
import { HomeControls } from '@/components/HomeControls';
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

const TIMER_UNITS = ['days', 'hours', 'minutes', 'seconds'] as const;

function formatYmd(
  ymd: { year: number; month: number; day: number },
  locale: string,
  includeYear = true,
): string {
  const d = new Date(ymd.year, ymd.month - 1, ymd.day);
  const opts: Intl.DateTimeFormatOptions = includeYear
    ? { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
    : { weekday: 'short', month: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat(locale, opts).format(d);
}

function formatObservedDate(
  ymd: { year: number; month: number; day: number },
  locale: string,
): string {
  const d = new Date(ymd.year, ymd.month - 1, ymd.day);
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

function ObservedDateNote({ holiday, locale }: { holiday: ResolvedHoliday; locale: string }) {
  const { t } = useTranslation();
  if (!holiday.observedDate) return null;
  const formatted = formatObservedDate(holiday.observedDate, locale);
  return (
    <p className="text-center text-xs text-brand/80 mt-1 italic">
      {t('countdown.publicHolidayOn', {
        date: formatted,
        defaultValue: `Public holiday on ${formatted}`,
      })}
    </p>
  );
}

function TimerUnitLabels() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center gap-0 mt-2 md:mt-3" aria-hidden>
      {TIMER_UNITS.map((unit, i) => (
        <div key={unit} className="flex items-center justify-center">
          <span
            className="text-[10px] md:text-xs uppercase tracking-widest text-app-muted w-[2.75rem] sm:w-[3.5rem] md:w-[4.5rem] lg:w-[5.5rem] text-center"
          >
            {t(`countdown.${unit}`, { defaultValue: unit })}
          </span>
          {i < 3 && (
            <span className="text-lg md:text-2xl font-light text-white/30 w-[0.5rem] md:w-4" />
          )}
        </div>
      ))}
    </div>
  );
}

function SecondaryCountdownCard({
  entry,
  locale,
}: {
  entry: SecondaryCelebration;
  locale: string;
}) {
  const { t } = useTranslation();
  const { days, hours, minutes, seconds } = useCountdown(entry.targetDate);
  const theme = getTheme(entry.holiday.definition.theme);
  const name = t(entry.holiday.definition.nameKey, {
    defaultValue: entry.holiday.definition.nameKey.split('.').pop(),
  });

  return (
    <div
      className="animate-slide-up rounded-xl px-4 py-3 md:px-5 md:py-4 backdrop-blur-md border border-white/15 bg-black/25"
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${theme.accentHsl} / 0.15) 0%, transparent 70%)`,
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs md:text-sm font-medium text-white/85 tracking-wide truncate">
          {entry.holiday.definition.emoji} {name}
        </span>
        <span className="text-[10px] md:text-xs text-app-muted whitespace-nowrap">
          {formatYmd(entry.holiday.date, locale, false)}
        </span>
      </div>
      <div className="flex items-center justify-center gap-1 tabular-nums">
        <span className="text-base md:text-xl font-semibold text-white/90">{formatNumber(days)}</span>
        <span className="text-base md:text-xl font-light text-white/40">:</span>
        <span className="text-base md:text-xl font-semibold text-white/90">{formatNumber(hours)}</span>
        <span className="text-base md:text-xl font-light text-white/40">:</span>
        <span className="text-base md:text-xl font-semibold text-white/90">{formatNumber(minutes)}</span>
        <span className="text-base md:text-xl font-light text-white/40">:</span>
        <span className="text-base md:text-xl font-semibold text-white/90">{formatNumber(seconds)}</span>
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
  const { showSecondary, setShowSecondary } = useShowSecondaryCountdown();
  const { setThemeVariant } = useAppTheme();
  const { days, hours, minutes, seconds, isComplete } = useCountdown(targetDate);

  const showCelebration = isCelebrationPeriod || isComplete;

  const { isSoundEnabled, isPlaying, toggleSound } = useCelebrationAudio(showCelebration);

  const themeVariant = holiday?.definition.theme ?? 'default';
  const theme = useMemo(() => getTheme(themeVariant), [themeVariant]);

  useEffect(() => {
    setThemeVariant(themeVariant);
  }, [themeVariant, setThemeVariant]);

  const holidayName = holiday
    ? t(holiday.definition.nameKey, {
        defaultValue: holiday.definition.nameKey.split('.').pop(),
      })
    : t('countdown.title');

  const holidayEmoji = holiday?.definition.emoji ?? '🎉';

  const countdownTitle = showCelebration
    ? holiday
      ? t('countdown.happyCelebration', {
          name: holidayName,
          defaultValue: `Happy ${holidayName}!`,
        })
      : t('countdown.happyNewYear')
    : holiday
      ? t('countdown.countingDownTo', {
          name: holidayName,
          defaultValue: `${holidayName} Countdown`,
        })
      : t('countdown.title');

  const visibleSecondary = secondaryHolidays.slice(0, 1);
  const timerValues = [days, hours, minutes, seconds];

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

      <AppShell
        variant="home"
        leftSlot={
          <>
            <FullscreenButton />
            <SoundToggleButton
              isSoundEnabled={isSoundEnabled}
              isPlaying={isPlaying}
              onToggle={toggleSound}
            />
          </>
        }
        rightSlot={
          <HomeControls
            timezone={timezone}
            onTimezoneChange={onTimezoneChange}
            selectedHolidayId={selectedHolidayId}
            onHolidayChange={onHolidayChange}
          />
        }
        contentClassName={
          photos.length > 0
            ? 'items-center justify-start pt-16 md:pt-20 px-4 pb-24'
            : 'items-center justify-center px-4 pb-24 pt-14 md:pt-16'
        }
      >
        <h1 className="page-title text-glow mb-6 md:mb-10 max-w-3xl capitalize">
          {countdownTitle}
        </h1>

        {!showCelebration ? (
          <div className="w-full max-w-3xl mx-auto space-y-5">
            <div
              className="rounded-lg md:rounded-xl px-6 py-4 md:px-10 md:py-6 animate-glow"
              role="timer"
              aria-live="polite"
              aria-label={t('countdown.timeRemaining')}
              style={{
                background: theme.gradient,
                boxShadow:
                  '0 4px 30px rgba(255, 220, 150, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              }}
            >
              <div className="flex items-center justify-center">
                {timerValues.map((val, i) => (
                  <div key={TIMER_UNITS[i]!} className="flex items-center">
                    <span className="text-3xl md:text-5xl lg:text-7xl font-bold text-white tabular-nums text-glow tracking-tight">
                      {formatNumber(val)}
                    </span>
                    {i < 3 && (
                      <span className="text-3xl md:text-5xl lg:text-7xl font-light text-white/70 mx-1 md:mx-2">
                        :
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <TimerUnitLabels />
            </div>

            {holiday && (
              <div>
                <p className="text-center text-sm md:text-base text-app-secondary">
                  {holiday.definition.emoji} {holidayName} — {formatYmd(holiday.date, locale)}
                </p>
                <ObservedDateNote holiday={holiday} locale={locale} />
              </div>
            )}

            {visibleSecondary.length > 0 && !showSecondary && (
              <button
                type="button"
                onClick={() => setShowSecondary(true)}
                className="block mx-auto text-xs text-app-muted hover:text-app-secondary transition-colors underline-offset-2 hover:underline min-h-[44px] px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
              >
                {t('countdown.showSecondary', {
                  defaultValue: 'Show upcoming holidays',
                })}
              </button>
            )}

            {visibleSecondary.length > 0 && showSecondary && (
              <div className="space-y-3 pt-2 max-w-md mx-auto w-full">
                <div className="flex items-center justify-center gap-2">
                  <p className="section-label">{t('countdown.alsoComingUp')}</p>
                  <button
                    type="button"
                    onClick={() => setShowSecondary(false)}
                    className="inline-flex items-center justify-center gap-1 rounded-full min-h-[44px] min-w-[44px] px-3 text-xs text-app-muted hover:text-app-secondary hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={t('countdown.hideSecondary', { defaultValue: 'Hide' })}
                  >
                    <span className="hidden sm:inline">
                      {t('countdown.hideSecondary', { defaultValue: 'Hide' })}
                    </span>
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                {visibleSecondary.map((entry) => (
                  <SecondaryCountdownCard
                    key={entry.holiday.definition.id}
                    entry={entry}
                    locale={locale}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-4xl md:text-6xl text-white animate-float mb-4">
              {holidayEmoji} 🎊 🥂
            </p>
            {isCelebrationPeriod && (
              <p className="text-lg md:text-xl text-app-secondary">
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

        <PhotoCarousel photos={photos} onAddClick={() => setShowPhotoUpload(true)} />
      </AppShell>
    </>
  );
});
