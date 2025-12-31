import { useState, useEffect } from 'react';
import { Countdown } from '@/components/Countdown';
import { getUserTimezone, getNewYearDate } from '@/lib/geolocation';

type AppState =
  | { status: 'loading' }
  | { status: 'ready'; timezone: string; targetDate: Date }
  | { status: 'error'; message: string };

function App() {
  const [state, setState] = useState<AppState>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        const timezone = await getUserTimezone();
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
  }, []);

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

  return <Countdown targetDate={state.targetDate} timezone={state.timezone} />;
}

export default App;
