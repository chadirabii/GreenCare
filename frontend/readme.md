# GreenCare Frontend

The frontend application for GreenCare, built with React, TypeScript, and Vite.

## Tech Stack

- React 18+
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- npm Package Manager

## Prerequisites

- Node.js (v18 or higher)
- npm (latest version)
- VS Code (recommended)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   │   └── ui/        # Shadcn UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── pages/         # Page components
│   └── assets/        # Static assets and images
├── public/            # Public static files
└── package.json       # Project dependencies and scripts
```

## Components

### Page Components

- `Index.tsx` - Home page
- `NotFound.tsx` - 404 error page

### Core Components

- `Navbar.tsx` - Navigation bar
- `Hero.tsx` - Hero section
- `Features.tsx` - Features section
- `Showcase.tsx` - Project showcase
- `CTABanner.tsx` - Call to action banner
- `Footer.tsx` - Footer section

### Custom Hooks

- `use-mobile.tsx` - Mobile responsiveness hook
- `use-toast.ts` - Toast notifications hook

## Styling

The project uses Tailwind CSS for styling with additional custom configurations in:

- `tailwind.config.ts`
- `postcss.config.js`

## Building for Production

```bash
npm run build
```

Built files will be in the `dist` directory, ready for deployment.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
