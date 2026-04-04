/**
 * Theme map: per-holiday visual tokens for medium-depth branding.
 *
 * Each variant defines CSS custom-property overrides, a title template
 * for <title>, a favicon emoji hint, and gradient accent stops.
 */

import type { ThemeVariant } from './types';

export interface HolidayTheme {
  /** CSS variable overrides applied to :root (HSL values). */
  accentHsl: string;
  accentForegroundHsl: string;
  /** Gradient stops for the countdown timer bar. */
  gradient: string;
  /** Body background gradient. */
  bodyGradient: string;
  /** Tab title template — `{{name}}` is replaced at runtime. */
  titleTemplate: string;
  /** Favicon emoji (rendered to a canvas-based favicon). */
  faviconEmoji: string;
}

export const HOLIDAY_THEMES: Record<ThemeVariant, HolidayTheme> = {
  new_year: {
    accentHsl: '45 80% 70%',
    accentForegroundHsl: '220 60% 8%',
    gradient:
      'linear-gradient(135deg, hsl(45,60%,75%) 0%, hsl(42,65%,68%) 20%, hsl(40,70%,62%) 40%, hsl(38,65%,58%) 60%, hsl(40,70%,65%) 80%, hsl(45,60%,72%) 100%)',
    bodyGradient: 'linear-gradient(180deg, #0a0f23 0%, #0f1932 50%, #0a1228 100%)',
    titleTemplate: '{{name}} Countdown 🎆',
    faviconEmoji: '🎆',
  },
  christmas: {
    accentHsl: '0 72% 51%',
    accentForegroundHsl: '120 100% 97%',
    gradient:
      'linear-gradient(135deg, hsl(0,72%,51%) 0%, hsl(348,83%,47%) 30%, hsl(120,61%,34%) 70%, hsl(0,72%,51%) 100%)',
    bodyGradient: 'linear-gradient(180deg, #1a0a0a 0%, #0f1a0f 50%, #0a0f0a 100%)',
    titleTemplate: '{{name}} Countdown 🎄',
    faviconEmoji: '🎄',
  },
  valentine: {
    accentHsl: '340 82% 52%',
    accentForegroundHsl: '0 0% 100%',
    gradient:
      'linear-gradient(135deg, hsl(340,82%,62%) 0%, hsl(350,80%,55%) 50%, hsl(330,70%,45%) 100%)',
    bodyGradient: 'linear-gradient(180deg, #1a0a14 0%, #200f1a 50%, #150a12 100%)',
    titleTemplate: '{{name}} Countdown ❤️',
    faviconEmoji: '❤️',
  },
  easter: {
    accentHsl: '280 60% 70%',
    accentForegroundHsl: '280 20% 15%',
    gradient:
      'linear-gradient(135deg, hsl(280,60%,75%) 0%, hsl(320,50%,70%) 30%, hsl(50,70%,75%) 60%, hsl(150,50%,65%) 100%)',
    bodyGradient: 'linear-gradient(180deg, #150a1f 0%, #1a1025 50%, #0f0a18 100%)',
    titleTemplate: '{{name}} Countdown 🐣',
    faviconEmoji: '🐣',
  },
  halloween: {
    accentHsl: '25 95% 53%',
    accentForegroundHsl: '0 0% 0%',
    gradient:
      'linear-gradient(135deg, hsl(25,95%,53%) 0%, hsl(35,90%,50%) 30%, hsl(270,50%,30%) 70%, hsl(25,95%,53%) 100%)',
    bodyGradient: 'linear-gradient(180deg, #0a0a0a 0%, #1a0f00 50%, #0f0a05 100%)',
    titleTemplate: '{{name}} Countdown 🎃',
    faviconEmoji: '🎃',
  },
  lunar_new_year: {
    accentHsl: '0 80% 50%',
    accentForegroundHsl: '45 90% 75%',
    gradient:
      'linear-gradient(135deg, hsl(0,80%,50%) 0%, hsl(350,85%,45%) 30%, hsl(45,90%,60%) 70%, hsl(0,80%,50%) 100%)',
    bodyGradient: 'linear-gradient(180deg, #1a0505 0%, #200a05 50%, #150505 100%)',
    titleTemplate: '{{name}} Countdown 🐉',
    faviconEmoji: '🐉',
  },
  diwali: {
    accentHsl: '38 92% 50%',
    accentForegroundHsl: '20 60% 10%',
    gradient:
      'linear-gradient(135deg, hsl(38,92%,60%) 0%, hsl(30,85%,50%) 30%, hsl(45,90%,55%) 70%, hsl(38,92%,60%) 100%)',
    bodyGradient: 'linear-gradient(180deg, #0f0a00 0%, #1a1005 50%, #0f0a00 100%)',
    titleTemplate: '{{name}} Countdown 🪔',
    faviconEmoji: '🪔',
  },
  carnival: {
    accentHsl: '280 80% 60%',
    accentForegroundHsl: '60 100% 95%',
    gradient:
      'linear-gradient(135deg, hsl(0,80%,55%) 0%, hsl(45,90%,55%) 25%, hsl(120,70%,45%) 50%, hsl(220,80%,55%) 75%, hsl(280,80%,55%) 100%)',
    bodyGradient: 'linear-gradient(180deg, #0f0a1a 0%, #15101f 50%, #0a0515 100%)',
    titleTemplate: '{{name}} Countdown 🎭',
    faviconEmoji: '🎭',
  },
  ramadan: {
    accentHsl: '150 60% 40%',
    accentForegroundHsl: '45 80% 85%',
    gradient:
      'linear-gradient(135deg, hsl(150,60%,40%) 0%, hsl(160,50%,35%) 30%, hsl(45,70%,55%) 70%, hsl(150,60%,40%) 100%)',
    bodyGradient: 'linear-gradient(180deg, #050f0a 0%, #0a1a10 50%, #050f0a 100%)',
    titleTemplate: '{{name}} 🌙',
    faviconEmoji: '🌙',
  },
  pride: {
    accentHsl: '300 80% 60%',
    accentForegroundHsl: '0 0% 100%',
    gradient:
      'linear-gradient(135deg, hsl(0,85%,55%) 0%, hsl(30,90%,55%) 16%, hsl(55,90%,55%) 33%, hsl(120,70%,45%) 50%, hsl(220,80%,55%) 66%, hsl(280,80%,55%) 83%, hsl(300,80%,55%) 100%)',
    bodyGradient: 'linear-gradient(180deg, #0a0a1a 0%, #0f1025 50%, #0a0a1a 100%)',
    titleTemplate: '{{name}} 🏳️‍🌈',
    faviconEmoji: '🏳️‍🌈',
  },
  independence: {
    accentHsl: '220 70% 50%',
    accentForegroundHsl: '0 0% 100%',
    gradient:
      'linear-gradient(135deg, hsl(0,75%,50%) 0%, hsl(0,0%,95%) 50%, hsl(220,75%,45%) 100%)',
    bodyGradient: 'linear-gradient(180deg, #0a0f1a 0%, #0f1525 50%, #0a0f1a 100%)',
    titleTemplate: '{{name}} Countdown 🎉',
    faviconEmoji: '🎉',
  },
  thanksgiving: {
    accentHsl: '25 70% 45%',
    accentForegroundHsl: '40 80% 90%',
    gradient:
      'linear-gradient(135deg, hsl(25,70%,50%) 0%, hsl(35,65%,45%) 30%, hsl(40,80%,55%) 70%, hsl(25,70%,50%) 100%)',
    bodyGradient: 'linear-gradient(180deg, #0f0a05 0%, #1a1008 50%, #0f0a05 100%)',
    titleTemplate: '{{name}} Countdown 🦃',
    faviconEmoji: '🦃',
  },
  spring: {
    accentHsl: '150 60% 50%',
    accentForegroundHsl: '150 20% 10%',
    gradient:
      'linear-gradient(135deg, hsl(150,60%,55%) 0%, hsl(340,70%,65%) 50%, hsl(50,80%,60%) 100%)',
    bodyGradient: 'linear-gradient(180deg, #050f0a 0%, #0a1a0f 50%, #050f0a 100%)',
    titleTemplate: '{{name}} Countdown 🌸',
    faviconEmoji: '🌸',
  },
  summer: {
    accentHsl: '200 80% 50%',
    accentForegroundHsl: '45 90% 95%',
    gradient:
      'linear-gradient(135deg, hsl(200,80%,55%) 0%, hsl(45,90%,60%) 50%, hsl(200,80%,55%) 100%)',
    bodyGradient: 'linear-gradient(180deg, #050a1a 0%, #0a1525 50%, #050a1a 100%)',
    titleTemplate: '{{name}} Countdown ☀️',
    faviconEmoji: '☀️',
  },
  fall: {
    accentHsl: '25 80% 50%',
    accentForegroundHsl: '25 20% 95%',
    gradient:
      'linear-gradient(135deg, hsl(25,80%,55%) 0%, hsl(35,75%,50%) 30%, hsl(10,70%,40%) 70%, hsl(25,80%,55%) 100%)',
    bodyGradient: 'linear-gradient(180deg, #0f0a05 0%, #1a1008 50%, #0f0a05 100%)',
    titleTemplate: '{{name}} Countdown 🍂',
    faviconEmoji: '🍂',
  },
  winter: {
    accentHsl: '210 60% 70%',
    accentForegroundHsl: '210 20% 10%',
    gradient:
      'linear-gradient(135deg, hsl(210,60%,75%) 0%, hsl(200,50%,80%) 30%, hsl(220,40%,65%) 70%, hsl(210,60%,75%) 100%)',
    bodyGradient: 'linear-gradient(180deg, #0a0f1a 0%, #0f1528 50%, #0a0f1a 100%)',
    titleTemplate: '{{name}} Countdown ❄️',
    faviconEmoji: '❄️',
  },
  cultural: {
    accentHsl: '45 70% 60%',
    accentForegroundHsl: '220 50% 10%',
    gradient:
      'linear-gradient(135deg, hsl(45,70%,65%) 0%, hsl(30,65%,55%) 30%, hsl(350,60%,50%) 70%, hsl(45,70%,65%) 100%)',
    bodyGradient: 'linear-gradient(180deg, #0f0a05 0%, #1a1008 50%, #0f0a05 100%)',
    titleTemplate: '{{name}} 🎊',
    faviconEmoji: '🎊',
  },
  default: {
    accentHsl: '45 80% 70%',
    accentForegroundHsl: '220 60% 8%',
    gradient:
      'linear-gradient(135deg, hsl(45,60%,75%) 0%, hsl(42,65%,68%) 20%, hsl(40,70%,62%) 40%, hsl(38,65%,58%) 60%, hsl(40,70%,65%) 80%, hsl(45,60%,72%) 100%)',
    bodyGradient: 'linear-gradient(180deg, #0a0f23 0%, #0f1932 50%, #0a1228 100%)',
    titleTemplate: 'Celebration Countdown 🎉',
    faviconEmoji: '🎉',
  },
};

export function getTheme(variant: ThemeVariant): HolidayTheme {
  return HOLIDAY_THEMES[variant] ?? HOLIDAY_THEMES.default;
}
