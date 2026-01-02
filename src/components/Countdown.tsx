import { memo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { useCelebrationAudio } from '@/hooks/useCelebrationAudio';
import { StarryFireworksBackground } from '@/components/StarryFireworksBackground';
import { PhotoCarousel } from '@/components/PhotoCarousel';
import { PhotoUpload } from '@/components/PhotoUpload';
import { TimezoneSelector } from '@/components/TimezoneSelector';
import { FullscreenButton } from '@/components/FullscreenButton';
import { LanguageSelector } from '@/components/LanguageSelector';
import { DonateButton } from '@/components/DonateButton';
import { SoundToggleButton } from '@/components/SoundToggleButton';
import { GlobalCelebrationsButton } from '@/components/GlobalCelebrations';

interface CountdownProps {
  targetDate: Date;
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  isCelebrationPeriod: boolean;
}

/**
 * Formats a number with leading zero
 */
const formatNumber = (num: number): string => String(num).padStart(2, '0');

/**
 * Main countdown component - New Year's Eve themed
 */
export const Countdown = memo(function Countdown({
  targetDate,
  timezone,
  onTimezoneChange,
  photos,
  onPhotosChange,
  isCelebrationPeriod,
}: CountdownProps) {
  const { t } = useTranslation();
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showFireworkHint, setShowFireworkHint] = useState(true);
  const { days, hours, minutes, seconds, isComplete } =
    useCountdown(targetDate);

  // Show celebration if we're in celebration period OR countdown is complete
  const showCelebration = isCelebrationPeriod || isComplete;

  // Hide firework hint after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFireworkHint(false);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  // Celebration audio
  const { isSoundEnabled, isPlaying, toggleSound } =
    useCelebrationAudio(showCelebration);

  return (
    <>
      {/* Animated Starry Fireworks Background - Enhanced during celebration */}
      <StarryFireworksBackground celebrationMode={showCelebration} />

      {/* Photo Upload Modal */}
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


      {/* Main Layout */}
      <main className="min-h-screen flex flex-col relative z-10">
        {/* Top Bar Controls - Responsive layout */}
        
        {/* Left Side Controls */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-1">
          <FullscreenButton />
          <LanguageSelector />
          <SoundToggleButton
            isSoundEnabled={isSoundEnabled}
            isPlaying={isPlaying}
            onToggle={toggleSound}
          />
        </div>

        {/* Right Side Controls - Stacked on mobile */}
        <div className="absolute top-3 right-3 z-30 flex flex-col items-end gap-1">
          {/* Row 1: Timezone */}
          <TimezoneSelector value={timezone} onChange={onTimezoneChange} />
          
          {/* Row 2: Donate - visible on mobile and desktop */}
          <DonateButton />
          
          {/* Row 3: World button */}
          <GlobalCelebrationsButton />
          
          {/* Firework Hint - Discrete hint below controls */}
          {showFireworkHint && (
            <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-white/50">
              <Sparkles className="h-3 w-3 text-amber-400/60" />
              <span>{t('fireworks.tapHint')}</span>
            </div>
          )}
        </div>

        {/* Content Container - Positioned above photos but below controls */}
        <div
          className={`flex-1 flex flex-col items-center px-4 z-10 ${
            photos.length > 0
              ? 'justify-start pt-20 md:pt-24'
              : 'justify-center pb-24'
          }`}
        >
          {/* Title */}
          <h1 className="text-xl md:text-3xl lg:text-4xl font-semibold text-white tracking-widest text-glow mb-6 md:mb-10 text-center uppercase">
            {showCelebration
              ? t('countdown.happyNewYear')
              : t('countdown.title')}
          </h1>

          {/* Countdown Timer Bar */}
          {!showCelebration ? (
            <div className="w-full max-w-3xl mx-auto">
              <div
                className="champagne-gradient rounded-lg md:rounded-xl px-6 py-4 md:px-10 md:py-6 animate-glow"
                role="timer"
                aria-label={t('countdown.timeRemaining')}
                style={{
                  boxShadow:
                    '0 4px 30px rgba(255, 220, 150, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                }}
              >
                <div className="flex items-center justify-center">
                  {/* Days */}
                  <span className="text-3xl md:text-5xl lg:text-7xl font-bold text-white tabular-nums text-glow tracking-tight">
                    {formatNumber(days)}
                  </span>
                  <span className="text-3xl md:text-5xl lg:text-7xl font-light text-white/70 mx-1 md:mx-2">
                    :
                  </span>

                  {/* Hours */}
                  <span className="text-3xl md:text-5xl lg:text-7xl font-bold text-white tabular-nums text-glow tracking-tight">
                    {formatNumber(hours)}
                  </span>
                  <span className="text-3xl md:text-5xl lg:text-7xl font-light text-white/70 mx-1 md:mx-2">
                    :
                  </span>

                  {/* Minutes */}
                  <span className="text-3xl md:text-5xl lg:text-7xl font-bold text-white tabular-nums text-glow tracking-tight">
                    {formatNumber(minutes)}
                  </span>
                  <span className="text-3xl md:text-5xl lg:text-7xl font-light text-white/70 mx-1 md:mx-2">
                    :
                  </span>

                  {/* Seconds */}
                  <span className="text-3xl md:text-5xl lg:text-7xl font-bold text-white tabular-nums text-glow tracking-tight">
                    {formatNumber(seconds)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-4xl md:text-6xl text-white animate-float mb-4">
                🎉 🎊 🥂
              </p>
              {isCelebrationPeriod && (
                <p className="text-lg md:text-xl text-white/80">
                  {t('countdown.celebrating')}
                </p>
              )}
            </div>
          )}

        </div>

        {/* Photo Carousel - Fixed at bottom */}
        <PhotoCarousel
          photos={photos}
          onAddClick={() => setShowPhotoUpload(true)}
        />
      </main>
    </>
  );
});
