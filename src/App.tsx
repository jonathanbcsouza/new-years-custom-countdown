import { useState, useEffect, useCallback } from 'react';
import { Countdown } from '@/components/Countdown';
import { getUserTimezone, getNewYearDate } from '@/lib/geolocation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { loadPhotos, savePhotos } from '@/lib/storage';

const TIMEZONE_STORAGE_KEY = 'countdown-timezone';

type AppState =
  | { status: 'loading' }
  | {
      status: 'ready';
      timezone: string;
      targetDate: Date;
      isCelebrationPeriod: boolean;
    }
  | { status: 'error'; message: string };

function App() {
  const [storedTimezone, setStoredTimezone] = useLocalStorage<string | null>(
    TIMEZONE_STORAGE_KEY,
    null
  );
  const [state, setState] = useState<AppState>({ status: 'loading' });
  const [photos, setPhotos] = useState<string[]>([]);

  // Load photos on mount
  useEffect(() => {
    const savedPhotos = loadPhotos();
    setPhotos(savedPhotos);
  }, []);

  // Handle photo changes
  const handlePhotosChange = useCallback((newPhotos: string[]) => {
    setPhotos(newPhotos);
    savePhotos(newPhotos);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        // Use stored timezone if available, otherwise detect
        let timezone: string;
        if (storedTimezone) {
          timezone = storedTimezone;
        } else {
          timezone = await getUserTimezone();
          setStoredTimezone(timezone);
        }

        const newYearResult = getNewYearDate(timezone);

        if (isMounted) {
          setState({
            status: 'ready',
            timezone,
            targetDate: newYearResult.targetDate,
            isCelebrationPeriod: newYearResult.isCelebrationPeriod,
          });
        }
      } catch (error) {
        console.error('Failed to initialize countdown:', error);

        if (isMounted) {
          // Attempt fallback
          try {
            const fallbackTz =
              Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
            const newYearResult = getNewYearDate(fallbackTz);
            setState({
              status: 'ready',
              timezone: fallbackTz,
              targetDate: newYearResult.targetDate,
              isCelebrationPeriod: newYearResult.isCelebrationPeriod,
            });
            setStoredTimezone(fallbackTz);
          } catch {
            setState({
              status: 'error',
              message: 'Failed to initialize countdown',
            });
          }
        }
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - storedTimezone is intentionally excluded

  // Recalculate when celebration period ends
  useEffect(() => {
    if (state.status !== 'ready' || !state.isCelebrationPeriod) return;

    const checkInterval = setInterval(() => {
      const now = Date.now();
      if (now >= state.targetDate.getTime()) {
        // Celebration period ended, recalculate for next year
        const newYearResult = getNewYearDate(state.timezone);
        setState({
          status: 'ready',
          timezone: state.timezone,
          targetDate: newYearResult.targetDate,
          isCelebrationPeriod: newYearResult.isCelebrationPeriod,
        });
      }
    }, 1000); // Check every second

    return () => clearInterval(checkInterval);
  }, [state]);

  const handleTimezoneChange = useCallback(
    (newTimezone: string) => {
      setStoredTimezone(newTimezone);
      const newYearResult = getNewYearDate(newTimezone);
      setState({
        status: 'ready',
        timezone: newTimezone,
        targetDate: newYearResult.targetDate,
        isCelebrationPeriod: newYearResult.isCelebrationPeriod,
      });
    },
    [setStoredTimezone]
  );

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p
          className="text-2xl text-muted-foreground animate-pulse"
          role="status"
        >
          Loading countdown...
        </p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-2xl text-destructive" role="alert">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <Countdown
      targetDate={state.targetDate}
      timezone={state.timezone}
      onTimezoneChange={handleTimezoneChange}
      photos={photos}
      onPhotosChange={handlePhotosChange}
      isCelebrationPeriod={state.isCelebrationPeriod}
    />
  );
}

export default App;
