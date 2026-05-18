import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getTheme, type HolidayTheme } from '@/lib/holidays/themes';
import type { ThemeVariant } from '@/lib/holidays/types';

const STORAGE_KEY = 'app-theme-variant';

interface ThemeContextValue {
  themeVariant: ThemeVariant;
  theme: HolidayTheme;
  setThemeVariant: (variant: ThemeVariant) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredVariant(): ThemeVariant {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && typeof raw === 'string') return raw as ThemeVariant;
  } catch {
    /* ignore */
  }
  return 'default';
}

function applyThemeToDocument(theme: HolidayTheme) {
  const root = document.documentElement;
  root.style.setProperty('--brand', theme.accentHsl);
  root.style.setProperty('--brand-foreground', theme.accentForegroundHsl);
  root.style.setProperty('--accent', theme.accentHsl);
  root.style.setProperty('--accent-foreground', theme.accentForegroundHsl);
  root.style.setProperty('--ring', theme.accentHsl);
  root.style.setProperty('--body-gradient', theme.bodyGradient);
  document.body.style.background = theme.bodyGradient;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeVariant, setVariantState] = useState<ThemeVariant>(readStoredVariant);
  const theme = useMemo(() => getTheme(themeVariant), [themeVariant]);

  const setThemeVariant = useCallback((variant: ThemeVariant) => {
    setVariantState(variant);
    try {
      localStorage.setItem(STORAGE_KEY, variant);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const value = useMemo(
    () => ({ themeVariant, theme, setThemeVariant }),
    [themeVariant, theme, setThemeVariant],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return ctx;
}

/** Parse --brand HSL components into rgba string prefix for canvas. */
export function brandColorPrefix(alpha = 1): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim();
  if (!raw) return `rgba(255, 215, 140, ${alpha})`;
  const parts = raw.split(/\s+/).map((p) => p.replace('%', ''));
  const h = Number(parts[0]) || 45;
  const s = Number(parts[1]) || 80;
  const l = Number(parts[2]) || 70;
  return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
}
