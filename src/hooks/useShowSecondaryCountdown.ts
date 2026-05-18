import { useLocalStorage } from '@/hooks/useLocalStorage';

const STORAGE_KEY = 'countdown-show-secondary';

/** Whether the "Also coming up" secondary countdown strip is visible. */
export function useShowSecondaryCountdown() {
  const [showSecondary, setShowSecondary] = useLocalStorage<boolean>(STORAGE_KEY, true);
  return { showSecondary, setShowSecondary } as const;
}
