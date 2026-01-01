/**
 * Google Analytics 4 integration
 * Note: GA is loaded directly in index.html per Google's instructions
 * This module provides helper functions for tracking events
 */

// Extend Window interface for gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    __GA_MEASUREMENT_ID__?: string;
  }
}

const GA_MEASUREMENT_ID = 
  import.meta.env.VITE_GA_MEASUREMENT_ID || 
  window.__GA_MEASUREMENT_ID__ || 
  'G-HZ7M97S5KL';

/**
 * Initialize Google Analytics
 * Note: GA script is already loaded in index.html
 * This function just verifies it's working and can be used for additional config
 */
export function initGA(): void {
  // Check if gtag is already loaded (from index.html)
  if (typeof window.gtag === 'function' && Array.isArray(window.dataLayer)) {
    console.log('Google Analytics: Already initialized from HTML');
    return;
  }

  // Fallback: If not loaded, initialize dynamically (shouldn't happen in production)
  if (import.meta.env.DEV) {
    console.log('Google Analytics: Running in development mode');
    // In dev, we might want to skip or use a test ID
    return;
  }

  // Only initialize if not already present
  if (!window.dataLayer) {
    window.dataLayer = [];
  }
  
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
  }

  // Add script if not already present
  const existingScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
  if (!existingScript) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);
  
  console.log('Google Analytics: Initialized');
}

/**
 * Track a page view
 */
export function trackPageView(path: string, title?: string): void {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title,
  });
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  window.gtag('event', eventName, params);
}

