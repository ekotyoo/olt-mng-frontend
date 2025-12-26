This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Overview

OLT management frontend built with Next.js App Router, React 19, Tailwind CSS 4, and Radix UI.

### Scripts

```bash
npm run dev           # Start dev server (Turbopack)
npm run build         # Build for production
npm start             # Start production server
npm run lint          # Run ESLint
npm run format        # Format with Prettier
npm run format:check  # Check formatting
```

### Requirements

- Node 18+ (recommended 20 LTS)
- PNPM/Yarn/NPM as preferred package manager

### Conventions

- Path alias `@/*` maps to `src/*`
- Code style is enforced with ESLint and Prettier
- Editor settings enforced via `.editorconfig`

### Structure

- `src/app` App Router pages and layouts
- `src/components` shared UI components
- `src/lib` domain logic (e.g., telnet service, parsers)

### Environment

Create a `.env.local` for any secrets or endpoints you need at runtime.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
