import { memo } from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CountdownProps {
  targetDate: Date;
  timezone?: string;
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
    <Card className="min-w-[100px] md:min-w-[140px]">
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
}: CountdownProps) {
  const { days, hours, minutes, seconds, isComplete } =
    useCountdown(targetDate);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-4xl w-full">
        <Card className="bg-card/50 backdrop-blur border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl md:text-5xl font-bold text-foreground">
              {isComplete ? '🎉 Happy New Year! 🎉' : "New Year's Countdown"}
            </CardTitle>
            {timezone && (
              <div className="flex justify-center mt-4">
                <Badge variant="secondary" className="text-xs">
                  📍 {timezone}
                </Badge>
              </div>
            )}
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
      </div>
    </main>
  );
});
