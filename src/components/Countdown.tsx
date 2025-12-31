import { memo, useState } from 'react';
import { Settings } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TimezoneSelector } from '@/components/TimezoneSelector';
import { BackgroundSlider } from '@/components/BackgroundSlider';
import { PhotoUpload } from '@/components/PhotoUpload';

interface CountdownProps {
  targetDate: Date;
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
}

interface TimeUnitProps {
  label: string;
  value: number;
}

/**
 * Displays a single time unit in a card-like container
 */
const TimeUnit = memo(function TimeUnit({ label, value }: TimeUnitProps) {
  const formattedValue = String(value).padStart(2, '0');

  return (
    <Card className="min-w-[100px] md:min-w-[140px] bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4 md:p-6 text-center">
        <span
          className="text-5xl md:text-7xl font-bold text-primary tabular-nums block"
          aria-live="polite"
          aria-atomic="true"
        >
          {formattedValue}
        </span>
        <span className="text-sm md:text-base text-muted-foreground uppercase tracking-wider mt-2 block">
          {label}
        </span>
      </CardContent>
    </Card>
  );
});

/**
 * Main countdown component displaying time remaining until target date
 */
export const Countdown = memo(function Countdown({
  targetDate,
  timezone,
  onTimezoneChange,
  photos,
  onPhotosChange,
}: CountdownProps) {
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const { days, hours, minutes, seconds, isComplete } =
    useCountdown(targetDate);

  return (
    <>
      {/* Background Slider */}
      <BackgroundSlider photos={photos} interval={5000} />

      <main className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="text-center max-w-4xl w-full">
          {/* Settings Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowPhotoUpload(!showPhotoUpload)}
            className="fixed top-4 right-4 bg-card/80 backdrop-blur-sm hover:bg-card z-20"
            aria-label="Upload photos"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Photo Upload Modal */}
          {showPhotoUpload && (
            <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <PhotoUpload
                photos={photos}
                onPhotosChange={onPhotosChange}
                maxPhotos={10}
                onClose={() => setShowPhotoUpload(false)}
              />
            </div>
          )}

          <Card className="bg-card/80 backdrop-blur-sm border-none shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl md:text-5xl font-bold text-foreground">
                {isComplete ? '🎉 Happy New Year! 🎉' : "New Year's Countdown"}
              </CardTitle>
              <div className="flex flex-col items-center gap-3 mt-4">
                <TimezoneSelector value={timezone} onChange={onTimezoneChange} />
                <Badge variant="secondary" className="text-xs">
                  📍 {timezone}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6 pb-8">
              {!isComplete ? (
                <div
                  className="flex flex-wrap gap-3 md:gap-6 justify-center"
                  role="timer"
                  aria-label="Time remaining until New Year"
                >
                  <TimeUnit label="Days" value={days} />
                  <TimeUnit label="Hours" value={hours} />
                  <TimeUnit label="Minutes" value={minutes} />
                  <TimeUnit label="Seconds" value={seconds} />
                </div>
              ) : (
                <p className="text-2xl text-muted-foreground">
                  Welcome to the New Year!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Photo hint */}
          {photos.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground/80">
              Click the ⚙ button to add your own photos as a background slideshow
            </p>
          )}
        </div>
      </main>
    </>
  );
});
