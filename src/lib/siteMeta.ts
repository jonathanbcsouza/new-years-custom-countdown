/** Canonical production URL for SEO and Open Graph tags. */
export const SITE_URL = 'https://www.chillycheers.com';

export const SITE_NAME = 'Chilly Cheers';

export const DEFAULT_META = {
  title: 'Celebration Countdown | Holidays, Fireworks & Photos',
  description:
    'Count down to holidays worldwide with stunning fireworks, your timezone, and personal photos. Cast to TV and share with family.',
  ogImagePath: '/og-image.png',
} as const;

export function absoluteUrl(path: string): string {
  const base = SITE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
