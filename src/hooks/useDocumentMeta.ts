import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to dynamically update document meta tags based on language
 * Updates title, description, and html lang attribute
 */
export function useDocumentMeta() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Update document title
    const title = t('meta.title');
    if (title && title !== 'meta.title') {
      document.title = title;
    }

    // Update meta description
    const description = t('meta.description');
    if (description && description !== 'meta.description') {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }

      // Also update OG description
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', description);
      }

      // Update Twitter description
      const twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (twitterDescription) {
        twitterDescription.setAttribute('content', description);
      }
    }

    // Update html lang attribute
    document.documentElement.lang = i18n.language;

    // Update OG title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && title && title !== 'meta.title') {
      ogTitle.setAttribute('content', title);
    }

    // Update Twitter title
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle && title && title !== 'meta.title') {
      twitterTitle.setAttribute('content', title);
    }
  }, [t, i18n.language]);
}

