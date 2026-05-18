import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getTheme } from '@/lib/holidays/themes';
import { absoluteUrl, DEFAULT_META } from '@/lib/siteMeta';
import type { ResolvedHoliday } from '@/lib/holidays';

/**
 * Renders an emoji to a 32x32 canvas and returns a data-URL suitable for <link rel="icon">.
 */
function emojiToFaviconUrl(emoji: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 16, 18);
  }
  return canvas.toDataURL('image/png');
}

function setFavicon(url: string) {
  let link: HTMLLinkElement | null = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
}

/**
 * Dynamically updates document title, meta description, html lang, and favicon
 * based on active holiday and language.
 */
export function useDocumentMeta(holiday?: ResolvedHoliday | null) {
  const { t, i18n } = useTranslation();
  const originalFaviconRef = useRef<string | null>(null);

  useEffect(() => {
    const existingLink: HTMLLinkElement | null = document.querySelector('link[rel="icon"]');
    if (existingLink && !originalFaviconRef.current) {
      originalFaviconRef.current = existingLink.href;
    }
  }, []);

  useEffect(() => {
    const theme = holiday ? getTheme(holiday.definition.theme) : null;

    if (holiday && theme) {
      const holidayName = t(holiday.definition.nameKey, {
        defaultValue: holiday.definition.nameKey.split('.').pop(),
      });
      const title = theme.titleTemplate.replace('{{name}}', holidayName);
      document.title = title;
      setFavicon(emojiToFaviconUrl(theme.faviconEmoji));
    } else {
      const title = t('meta.title');
      if (title && title !== 'meta.title') {
        document.title = title;
      }
      if (originalFaviconRef.current) {
        setFavicon(originalFaviconRef.current);
      }
    }

    const description = t('meta.description');
    const resolvedDescription =
      description && description !== 'meta.description'
        ? description
        : DEFAULT_META.description;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', resolvedDescription);
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', resolvedDescription);
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', resolvedDescription);

    document.documentElement.lang = i18n.language;

    const currentTitle = document.title;
    const metaTitle = document.querySelector('meta[name="title"]');
    if (metaTitle) metaTitle.setAttribute('content', currentTitle);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', currentTitle);
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', currentTitle);

    const ogImage = absoluteUrl(DEFAULT_META.ogImagePath);
    const ogImageEl = document.querySelector('meta[property="og:image"]');
    if (ogImageEl) ogImageEl.setAttribute('content', ogImage);
    const ogImageSecure = document.querySelector('meta[property="og:image:secure_url"]');
    if (ogImageSecure) ogImageSecure.setAttribute('content', ogImage);
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) twitterImage.setAttribute('content', ogImage);
  }, [t, i18n.language, holiday]);
}
