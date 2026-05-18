import { useLocalStorage } from '@/hooks/useLocalStorage';

const STORAGE_KEY = 'holiday-scope-all-countries';

/**
 * Browse scope: holidays for the user's region vs full global catalog.
 * Persisted so /holidays remembers the choice across visits.
 */
export function useHolidayScopeFilter() {
  const [allCountries, setAllCountries] = useLocalStorage<boolean>(STORAGE_KEY, false);
  return { allCountries, setAllCountries } as const;
}
