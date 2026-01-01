# New Year's Eve Countdown

A beautiful, modern New Year's countdown application with automatic timezone detection, photo uploads, and festive animations. Built with React, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- **Automatic Timezone Detection** - Detects user's timezone via IP geolocation (ip-api.com) with browser fallback
- **Timezone Selector** - Choose any timezone worldwide with searchable continent/country/city hierarchy
- **Celebration Indicators** - Visual indicators show which countries have already reached New Year
- **Real-time Countdown** - Live countdown timer updating every second
- **Photo Upload** - Upload and display your own photos in a beautiful carousel slideshow
- **Animated Background** - Dynamic starry night sky with interactive fireworks animation
- **Celebration Mode** - Automatically shows "Happy New Year!" message for 24 hours after midnight
- **Internationalization** - Available in 21 languages with language selector
- **Fullscreen Mode** - Cast to TV for family viewing
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Accessible** - ARIA labels and semantic HTML for screen readers
- **PWA Ready** - Progressive Web App manifest for installable experience
- **SEO Optimized** - Open Graph and Twitter Card meta tags for social sharing

## Tech Stack

- **React 19** - Modern UI library
- **TypeScript** - Type safety and better DX
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **react-i18next** - Internationalization framework
- **ip-api.com** - IP geolocation API for timezone detection
- **Google Analytics 4** - Website analytics

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/jonathanbcsouza/new-years-custom-countdown.git
cd new-years-custom-countdown

# Install dependencies
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

Build for production:

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Countdown.tsx              # Main countdown display component
│   ├── TimezoneSelector.tsx       # Timezone selection dropdown
│   ├── PhotoUpload.tsx            # Photo upload modal
│   ├── PhotoCarousel.tsx          # Photo slideshow carousel
│   ├── StarryFireworksBackground.tsx  # Animated background
│   ├── FullscreenButton.tsx      # Fullscreen toggle
│   ├── LanguageSelector.tsx      # Language selection
│   ├── DonateButton.tsx          # Donation button
│   └── ui/                        # shadcn/ui components
├── hooks/
│   ├── useCountdown.ts            # Countdown timer logic
│   ├── useLocalStorage.ts         # LocalStorage hook
│   └── useDocumentMeta.ts         # Dynamic meta tags hook
├── lib/
│   ├── geolocation.ts             # Timezone detection & date calculations
│   ├── timezones.ts               # Timezone data and utilities
│   ├── storage.ts                 # Photo storage utilities
│   ├── analytics.ts               # Google Analytics integration
│   ├── i18n.ts                    # Internationalization setup
│   └── utils.ts                   # Utility functions
├── locales/                       # Translation files (21 languages)
├── App.tsx                        # Main app component
├── main.tsx                       # Application entry point
└── index.css                      # Global styles with Tailwind
```

## How It Works

1. **Timezone Detection**: On load, the app calls `ip-api.com` to detect the user's timezone based on their IP address
2. **Fallback Strategy**: If the API fails, it falls back to the browser's timezone, then UTC as last resort
3. **Date Calculation**: Calculates the exact moment when New Year's arrives in the detected timezone
4. **Celebration Period**: If New Year's has already passed but is within 24 hours, shows celebration message
5. **Countdown Timer**: Uses a custom `useCountdown` hook that updates every second
6. **Photo Storage**: User-uploaded photos are compressed and stored in localStorage
7. **Background Animation**: Canvas-based starry sky with fireworks that intensify during celebration
8. **Internationalization**: Language preference is stored and applied across all UI elements

## Supported Languages

The app supports 21 languages:
- English
- Maori (Te Reo Māori)
- Chinese (中文)
- Hindi (हिन्दी)
- Spanish (Español)
- French (Français)
- Arabic (العربية)
- Bengali (বাংলা)
- Portuguese (Português)
- Russian (Русский)
- Japanese (日本語)
- Indonesian (Bahasa Indonesia)
- German (Deutsch)
- Korean (한국어)
- Turkish (Türkçe)
- Vietnamese (Tiếng Việt)
- Italian (Italiano)
- Thai (ไทย)
- Polish (Polski)
- Dutch (Nederlands)
- Ukrainian (Українська)

## Adding More shadcn/ui Components

To add more shadcn/ui components, use the CLI:

```bash
npx shadcn@latest add [component-name]
```

For example:

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
```

## API Usage

This app uses **ip-api.com** for timezone detection:

- **Endpoint**: `https://ip-api.com/json/?fields=timezone`
- **Rate Limit**: 45 requests/minute (free tier)
- **Fallback**: Browser timezone → UTC

No API key required for basic usage.

## Environment Variables

For production deployment, configure the following environment variable:

- `VITE_GA_MEASUREMENT_ID` - Google Analytics 4 measurement ID (optional)

## Code Quality

- TypeScript strict mode
- ESLint configured
- React best practices (memo, useCallback, proper cleanup)
- Accessibility (ARIA labels, semantic HTML)
- Responsive design with Tailwind
- Component-based architecture
- Error handling and fallbacks

## Deployment

This app can be deployed to:

- **Vercel** (recommended) - Zero config, automatic deployments, free tier
- **Netlify** - Similar to Vercel
- **AWS S3 + CloudFront** - For AWS infrastructure

The app is a static site, so any static hosting service will work.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is open source and available for personal use.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [ip-api.com](https://ip-api.com/) for timezone detection
- [Vite](https://vitejs.dev/) for the amazing dev experience
- [react-i18next](https://react.i18next.com/) for internationalization
