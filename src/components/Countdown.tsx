import { memo, useState } from 'react';
import { Globe } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { Button } from '@/components/ui/button';
import { FireworksBackground } from '@/components/FireworksBackground';
import { PhotoCarousel } from '@/components/PhotoCarousel';
import { PhotoUpload } from '@/components/PhotoUpload';
import { TimezoneSelector } from '@/components/TimezoneSelector';

interface CountdownProps {
  targetDate: Date;
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
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
}: CountdownProps) {
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showTimezone, setShowTimezone] = useState(false);
  const { days, hours, minutes, seconds, isComplete } = useCountdown(targetDate);

  return (
    <>
      {/* Fireworks Background */}
      <FireworksBackground />

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
        {/* Timezone Selector - Top Right */}
        <div className="absolute top-4 right-4 z-20">
          {showTimezone ? (
            <div className="animate-in">
              <TimezoneSelector
                value={timezone}
                onChange={(tz) => {
                  onTimezoneChange(tz);
                  setShowTimezone(false);
                }}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTimezone(true)}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Globe className="h-4 w-4 mr-2" />
              <span className="text-xs">{timezone.split('/').pop()?.replace(/_/g, ' ')}</span>
            </Button>
          )}
        </div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          {/* Title */}
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white tracking-wider text-glow mb-8 md:mb-12 text-center">
            {isComplete ? '🎉 HAPPY NEW YEAR! 🎉' : "NEW YEAR'S EVE COUNTDOWN"}
          </h1>

          {/* Countdown Timer Bar */}
          {!isComplete ? (
            <div className="w-full max-w-4xl mx-auto mb-8 md:mb-12">
              <div 
                className="gold-gradient rounded-lg md:rounded-xl p-4 md:p-6 animate-glow"
                role="timer"
                aria-label="Time remaining until New Year"
              >
                <div className="flex items-center justify-center gap-2 md:gap-4">
                  {/* Days */}
                  <div className="text-center">
                    <span className="text-4xl md:text-6xl lg:text-8xl font-bold text-white tabular-nums text-glow">
                      {formatNumber(days)}
                    </span>
                  </div>
                  <span className="text-4xl md:text-6xl lg:text-8xl font-bold text-white/80">:</span>
                  
                  {/* Hours */}
                  <div className="text-center">
                    <span className="text-4xl md:text-6xl lg:text-8xl font-bold text-white tabular-nums text-glow">
                      {formatNumber(hours)}
                    </span>
                  </div>
                  <span className="text-4xl md:text-6xl lg:text-8xl font-bold text-white/80">:</span>
                  
                  {/* Minutes */}
                  <div className="text-center">
                    <span className="text-4xl md:text-6xl lg:text-8xl font-bold text-white tabular-nums text-glow">
                      {formatNumber(minutes)}
                    </span>
                  </div>
                  <span className="text-4xl md:text-6xl lg:text-8xl font-bold text-white/80">:</span>
                  
                  {/* Seconds */}
                  <div className="text-center">
                    <span className="text-4xl md:text-6xl lg:text-8xl font-bold text-white tabular-nums text-glow">
                      {formatNumber(seconds)}
                    </span>
                  </div>
                </div>

                {/* Labels */}
                <div className="flex items-center justify-center gap-8 md:gap-16 mt-2 md:mt-4">
                  <span className="text-xs md:text-sm text-white/70 uppercase tracking-widest">Days</span>
                  <span className="text-xs md:text-sm text-white/70 uppercase tracking-widest">Hours</span>
                  <span className="text-xs md:text-sm text-white/70 uppercase tracking-widest">Min</span>
                  <span className="text-xs md:text-sm text-white/70 uppercase tracking-widest">Sec</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center mb-12">
              <p className="text-3xl md:text-5xl text-white animate-float">
                Welcome to the New Year! 🎊
              </p>
            </div>
          )}

          {/* Photo Carousel */}
          <PhotoCarousel 
            photos={photos} 
            onAddClick={() => setShowPhotoUpload(true)} 
          />
        </div>
      </main>
    </>
  );
});
