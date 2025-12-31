import { useState, useEffect } from 'react';
import { Countdown } from '@/components/Countdown';
import { getUserTimezone, getNewYearDate } from '@/lib/geolocation';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const STORAGE_KEY = 'countdown-timezone';

type AppState =
  | { status: 'loading' }
  | { status: 'ready'; timezone: string; targetDate: Date }
  | { status: 'error'; message: string };

function App() {
  const [storedTimezone, setStoredTimezone] = useLocalStorage<string | null>(
    STORAGE_KEY,
    null
  );
  const [state, setState] = useState<AppState>({ status: 'loading' });

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

        const targetDate = getNewYearDate(timezone);

        if (isMounted) {
          setState({ status: 'ready', timezone, targetDate });
        }
      } catch (error) {
        console.error('Failed to initialize countdown:', error);

        if (isMounted) {
          // Attempt fallback
          try {
            const fallbackTz =
              Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
            const targetDate = getNewYearDate(fallbackTz);
            setState({ status: 'ready', timezone: fallbackTz, targetDate });
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

  const handleTimezoneChange = (newTimezone: string) => {
    setStoredTimezone(newTimezone);
    const targetDate = getNewYearDate(newTimezone);
    setState({ status: 'ready', timezone: newTimezone, targetDate });
  };

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
    />
  );
}

export default App;
