import { memo, useState } from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import { StarryFireworksBackground } from '@/components/StarryFireworksBackground';
import { PhotoCarousel } from '@/components/PhotoCarousel';
import { PhotoUpload } from '@/components/PhotoUpload';
import { TimezoneSelector } from '@/components/TimezoneSelector';
import { FullscreenButton } from '@/components/FullscreenButton';

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
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const { days, hours, minutes, seconds, isComplete } =
    useCountdown(targetDate);

  // Show celebration if we're in celebration period OR countdown is complete
  const showCelebration = isCelebrationPeriod || isComplete;

  return (
    <>
      {/* Animated Starry Fireworks Background */}
      <StarryFireworksBackground />

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
        {/* Top Bar Controls */}
        {/* Fullscreen Button - Top Left */}
        <div className="absolute top-4 left-4 z-20">
          <FullscreenButton />
        </div>

        {/* Timezone Selector - Top Right */}
        <div className="absolute top-4 right-4 z-20">
          <TimezoneSelector value={timezone} onChange={onTimezoneChange} />
        </div>

        {/* Content Container - Positioned above photos */}
        <div
          className={`flex-1 flex flex-col items-center px-4 ${
            photos.length > 0
              ? 'justify-start pt-16 md:pt-20'
              : 'justify-center pb-24'
          }`}
        >
          {/* Title */}
          <h1 className="text-xl md:text-3xl lg:text-4xl font-semibold text-white tracking-widest text-glow mb-6 md:mb-10 text-center uppercase">
            {showCelebration ? 'HAPPY NEW YEAR!' : "NEW YEAR'S EVE COUNTDOWN"}
          </h1>

          {/* Countdown Timer Bar */}
          {!showCelebration ? (
            <div className="w-full max-w-3xl mx-auto">
              <div
                className="champagne-gradient rounded-lg md:rounded-xl px-6 py-4 md:px-10 md:py-6 animate-glow"
                role="timer"
                aria-label="Time remaining until New Year"
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
                  Celebrating the first 24 hours of the New Year!
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
