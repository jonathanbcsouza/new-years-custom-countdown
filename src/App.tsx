import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Countdown } from '@/components/Countdown';
import {
  getUserTimezone,
  getCelebration,
  getUpcomingSecondary,
  type CelebrationResult,
  type SecondaryCelebration,
} from '@/lib/geolocation';
import { getPrimaryCountryCodeForTimezone } from '@/lib/timezoneCountry';
import { resolveHolidayById } from '@/lib/holidays';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TIMEZONE_STORAGE_KEY } from '@/hooks/useHolidayContext';
import { usePublicHolidayFilter } from '@/hooks/usePublicHolidayFilter';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { loadPhotos, savePhotos } from '@/lib/storage';
import type { ResolvedHoliday } from '@/lib/holidays';

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

interface LocationState {
  holidayId?: string;
}

function App() {
  const { t } = useTranslation();
  const location = useLocation();
  const [storedTimezone, setStoredTimezone] = useLocalStorage<string | null>(
    TIMEZONE_STORAGE_KEY,
    null
  );
  const [selectedHolidayId, setSelectedHolidayId] = useState<string | null>(null);
  const { publicOnly } = usePublicHolidayFilter();
  const [state, setState] = useState<AppState>({ status: 'loading' });
  const [photos, setPhotos] = useState<string[]>([]);

  const activeHoliday = state.status === 'ready' ? state.holiday : null;
  useDocumentMeta(activeHoliday);

  const computeCelebration = useCallback(
    (timezone: string, holidayId: string | null, publicOnlyFilter: boolean) => {
      const cc = getPrimaryCountryCodeForTimezone(timezone);
      const result = getCelebration(timezone, cc, holidayId, { publicOnly: publicOnlyFilter });
      const secondary =
        holidayId === null
          ? getUpcomingSecondary(timezone, cc, 7, publicOnlyFilter)
          : [];
      return { result, secondary };
    },
    [],
  );

  const applyCelebration = useCallback(
    (
      timezone: string,
      result: CelebrationResult,
      secondary: SecondaryCelebration[],
    ) => {
      setState({
        status: 'ready',
        timezone,
        targetDate: result.targetDate,
        isCelebrationPeriod: result.isCelebrationPeriod,
        holiday: result.holiday,
        secondaryHolidays: secondary,
      });
    },
    []
  );

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

        const navState = location.state as LocationState | null;
        let holidayId: string | null = null;
        if (navState?.holidayId) {
          const cc = getPrimaryCountryCodeForTimezone(timezone);
          const pinned = resolveHolidayById(
            navState.holidayId,
            { timezone, countryCode: cc },
            new Date(),
          );
          if (pinned) {
            holidayId = navState.holidayId;
            setSelectedHolidayId(holidayId);
          }
        }

        const { result, secondary } = computeCelebration(timezone, holidayId, publicOnly);
        if (isMounted) applyCelebration(timezone, result, secondary);
      } catch (error) {
        console.error('Failed to initialize countdown:', error);
        if (isMounted) {
          try {
            const fallbackTz =
              Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
            const { result, secondary } = computeCelebration(fallbackTz, null, publicOnly);
            applyCelebration(fallbackTz, result, secondary);
            setStoredTimezone(fallbackTz);
          } catch {
            setState({ status: 'error', message: 'Failed to initialize countdown' });
          }
        }
      }
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
        const { result, secondary } = computeCelebration(
          state.timezone,
          selectedHolidayId,
          publicOnly,
        );
        applyCelebration(state.timezone, result, secondary);
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [state, selectedHolidayId, publicOnly, computeCelebration, applyCelebration]);

  useEffect(() => {
    if (state.status !== 'ready') return;
    const { result, secondary } = computeCelebration(
      state.timezone,
      selectedHolidayId,
      publicOnly,
    );
    applyCelebration(state.timezone, result, secondary);
  }, [publicOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTimezoneChange = useCallback(
    (newTimezone: string) => {
      setStoredTimezone(newTimezone);
      let holidayId = selectedHolidayId;
      if (holidayId) {
        const cc = getPrimaryCountryCodeForTimezone(newTimezone);
        const pinned = resolveHolidayById(
          holidayId,
          { timezone: newTimezone, countryCode: cc },
          new Date(),
        );
        if (!pinned) {
          holidayId = null;
          setSelectedHolidayId(null);
        }
      }
      const { result, secondary } = computeCelebration(newTimezone, holidayId, publicOnly);
      applyCelebration(newTimezone, result, secondary);
    },
    [selectedHolidayId, publicOnly, setStoredTimezone, computeCelebration, applyCelebration],
  );

  const handleHolidayChange = useCallback(
    (holidayId: string | null) => {
      setSelectedHolidayId(holidayId);
      if (state.status !== 'ready') return;
      const { result, secondary } = computeCelebration(
        state.timezone,
        holidayId,
        publicOnly,
      );
      applyCelebration(state.timezone, result, secondary);
    },
    [state, publicOnly, computeCelebration, applyCelebration],
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
      selectedHolidayId={selectedHolidayId}
      onHolidayChange={handleHolidayChange}
    />
  );
}

export default App;
