import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Countdown } from '@/components/Countdown';
import {
  getUserTimezone,
  getNextCelebration,
  getUpcomingSecondary,
  type CelebrationResult,
  type SecondaryCelebration,
} from '@/lib/geolocation';
import { getPrimaryCountryCodeForTimezone } from '@/lib/timezoneCountry';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { loadPhotos, savePhotos } from '@/lib/storage';
import type { ResolvedHoliday } from '@/lib/holidays';

const TIMEZONE_STORAGE_KEY = 'countdown-timezone';

type AppState =
  | { status: 'loading' }
  | {
      status: 'ready';
      timezone: string;
      targetDate: Date;
      isCelebrationPeriod: boolean;
      holiday: ResolvedHoliday | null;
      secondaryHolidays: SecondaryCelebration[];
    }
  | { status: 'error'; message: string };

function App() {
  const { t } = useTranslation();
  const [storedTimezone, setStoredTimezone] = useLocalStorage<string | null>(
    TIMEZONE_STORAGE_KEY,
    null
  );
  const [state, setState] = useState<AppState>({ status: 'loading' });
  const [photos, setPhotos] = useState<string[]>([]);

  const activeHoliday = state.status === 'ready' ? state.holiday : null;
  useDocumentMeta(activeHoliday);

  useEffect(() => {
    const savedPhotos = loadPhotos();
    setPhotos(savedPhotos);
  }, []);

  const handlePhotosChange = useCallback((newPhotos: string[]) => {
    setPhotos(newPhotos);
    savePhotos(newPhotos);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        let timezone: string;
        if (storedTimezone) {
          timezone = storedTimezone;
        } else {
          timezone = await getUserTimezone();
          setStoredTimezone(timezone);
        }

        const cc = getPrimaryCountryCodeForTimezone(timezone);
        const result = getNextCelebration(timezone, cc);
        const secondary = getUpcomingSecondary(timezone, cc);

        if (isMounted) applyResult(timezone, result, secondary);
      } catch (error) {
        console.error('Failed to initialize countdown:', error);
        if (isMounted) {
          try {
            const fallbackTz =
              Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
            const cc = getPrimaryCountryCodeForTimezone(fallbackTz);
            const result = getNextCelebration(fallbackTz, cc);
            const secondary = getUpcomingSecondary(fallbackTz, cc);
            applyResult(fallbackTz, result, secondary);
            setStoredTimezone(fallbackTz);
          } catch {
            setState({ status: 'error', message: 'Failed to initialize countdown' });
          }
        }
      }
    }

    function applyResult(tz: string, r: CelebrationResult, sec: SecondaryCelebration[]) {
      setState({
        status: 'ready',
        timezone: tz,
        targetDate: r.targetDate,
        isCelebrationPeriod: r.isCelebrationPeriod,
        holiday: r.holiday,
        secondaryHolidays: sec,
      });
    }

    initialize();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.status !== 'ready') return;

    const checkInterval = setInterval(() => {
      const now = Date.now();
      if (now >= state.targetDate.getTime()) {
        const cc = getPrimaryCountryCodeForTimezone(state.timezone);
        const result = getNextCelebration(state.timezone, cc);
        const secondary = getUpcomingSecondary(state.timezone, cc);
        setState({
          status: 'ready',
          timezone: state.timezone,
          targetDate: result.targetDate,
          isCelebrationPeriod: result.isCelebrationPeriod,
          holiday: result.holiday,
          secondaryHolidays: secondary,
        });
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [state]);

  const handleTimezoneChange = useCallback(
    (newTimezone: string) => {
      setStoredTimezone(newTimezone);
      const cc = getPrimaryCountryCodeForTimezone(newTimezone);
      const result = getNextCelebration(newTimezone, cc);
      const secondary = getUpcomingSecondary(newTimezone, cc);
      setState({
        status: 'ready',
        timezone: newTimezone,
        targetDate: result.targetDate,
        isCelebrationPeriod: result.isCelebrationPeriod,
        holiday: result.holiday,
        secondaryHolidays: secondary,
      });
    },
    [setStoredTimezone]
  );

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-2xl text-muted-foreground animate-pulse" role="status">
          {t('common.loading')}
        </p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-2xl text-destructive" role="alert">
          {t('common.error')}
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
      holiday={state.holiday}
      secondaryHolidays={state.secondaryHolidays}
    />
  );
}

export default App;
