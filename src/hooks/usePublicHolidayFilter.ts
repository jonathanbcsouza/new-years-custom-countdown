import { useLocalStorage } from '@/hooks/useLocalStorage';

const STORAGE_KEY = 'holiday-public-only';

/**
 * Shared filter: show only statutory public holidays vs all celebrations.
 * Persisted in localStorage so countdown dropdown and /holidays stay in sync.
 */
export function usePublicHolidayFilter() {
  const [publicOnly, setPublicOnly] = useLocalStorage<boolean>(STORAGE_KEY, false);
  return { publicOnly, setPublicOnly } as const;
}
