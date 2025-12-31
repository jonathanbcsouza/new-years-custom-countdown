# New Year's Countdown App

A beautiful, modern New Year's countdown application with automatic timezone detection. Built with React, TypeScript, Tailwind CSS, and shadcn/ui.

## ✨ Features

- 🎯 **Automatic Timezone Detection** - Detects user's timezone via IP geolocation (ip-api.com) with browser fallback
- ⏱️ **Real-time Countdown** - Live countdown timer updating every second
- 🎨 **Beautiful UI** - Built with shadcn/ui components (Card, Badge) for a polished look
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ♿ **Accessible** - ARIA labels and semantic HTML for screen readers
- 🚀 **Fast & Lightweight** - Optimized build with Vite

## 🛠️ Tech Stack

- **React 19** - Modern UI library
- **TypeScript** - Type safety and better DX
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **ip-api.com** - IP geolocation API for timezone detection

## 🚀 Getting Started

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

## 📁 Project Structure

```
src/
├── components/
│   ├── Countdown.tsx      # Main countdown display component
│   └── ui/
│       ├── card.tsx       # shadcn/ui Card component
│       └── badge.tsx      # shadcn/ui Badge component
├── hooks/
│   └── useCountdown.ts # Countdown timer logic hook
├── lib/
│   ├── geolocation.ts     # Timezone detection & date calculations
│   └── utils.ts           # Utility functions (cn helper)
├── App.tsx                # Main app component with state management
├── main.tsx               # Application entry point
└── index.css              # Global styles with Tailwind
```

## 🔧 How It Works

1. **Timezone Detection**: On load, the app calls `ip-api.com` to detect the user's timezone based on their IP address
2. **Fallback Strategy**: If the API fails, it falls back to the browser's timezone, then UTC as last resort
3. **Date Calculation**: Calculates the exact moment when New Year's arrives in the detected timezone
4. **Countdown Timer**: Uses a custom `useCountdown` hook that updates every second
5. **UI Display**: Shows the countdown in beautiful shadcn/ui Card components

## 🎨 Adding More shadcn/ui Components

To add more shadcn/ui components, use the CLI:

```bash
npx shadcn@latest add [component-name]
```

For example:

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
```

## 🌐 API Usage

This app uses **ip-api.com** for timezone detection:

- **Endpoint**: `https://ip-api.com/json/?fields=timezone`
- **Rate Limit**: 45 requests/minute (free tier)
- **Fallback**: Browser timezone → UTC

No API key required for basic usage.

## 📝 Code Quality

- ✅ TypeScript strict mode
- ✅ ESLint configured
- ✅ React best practices (memo, useCallback, proper cleanup)
- ✅ Accessibility (ARIA labels, semantic HTML)
- ✅ Responsive design with Tailwind

## 🚢 Deployment

This app can be deployed to:

- **Vercel** (recommended) - Zero config, automatic deployments
- **Netlify** - Similar to Vercel
- **AWS S3 + CloudFront** - For AWS infrastructure

The app is a static site, so any static hosting service will work.

## 📄 License

This project is open source and available for personal use.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [ip-api.com](https://ip-api.com/) for timezone detection
- [Vite](https://vitejs.dev/) for the amazing dev experience
