# New Year Countdown App

A modern React application built with TypeScript, Tailwind CSS, and shadcn/ui.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful component library

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

### Build

Build for production:

```bash
npm run build
```

### Preview

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
  ├── components/
  │   └── ui/          # shadcn/ui components
  ├── lib/
  │   └── utils.ts     # Utility functions (cn helper)
  ├── App.tsx          # Main app component
  ├── main.tsx         # App entry point
  └── index.css        # Global styles with Tailwind
```

## Adding shadcn/ui Components

To add more shadcn/ui components, you can use the CLI:

```bash
npx shadcn@latest add [component-name]
```

For example:

```bash
npx shadcn@latest add card
npx shadcn@latest add input
```

## Features

- ✅ React with TypeScript
- ✅ Tailwind CSS configured
- ✅ shadcn/ui components ready
- ✅ Path aliases configured (`@/` for `src/`)
- ✅ Modern build setup with Vite
