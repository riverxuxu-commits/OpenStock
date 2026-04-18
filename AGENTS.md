# OpenStock Agent Guidelines

## Project Overview

- **Stack**: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4
- **Database**: MongoDB with Mongoose + better-auth for authentication
- **Testing**: Vitest + node environment
- **Path Alias**: `@/` maps to project root

## Development Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server

# Linting
npm run lint         # ESLint (next/core-web-vitals + next/typescript)

# Testing
npm run test         # Run all tests once (Vitest)
npm run test:watch   # Watch mode for development
```

### Running Single Test Files

```bash
# Run specific test file
npx vitest run __tests__/ai-provider.test.ts

# Run with watch mode
npx vitest __tests__/ai-provider.test.ts

# Run tests matching pattern
npx vitest run --grep "getProviderConfig"
```

### Database Testing

```bash
npm run test:db      # Test database connection (scripts/test-db.mjs)
```

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** - no implicit any, strict null checks
- Use explicit types for function parameters and return values
- Prefer `type` over `interface` for simple type definitions
- Use `unknown` instead of `any` when type is uncertain

### Imports

- Use path alias `@/` for internal imports (e.g., `@/lib/utils`)
- Group imports: external packages → internal packages → relative imports
- Named imports preferred where possible

```typescript
import { describe, it, expect, vi } from "vitest";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { NextConfig } from "next";
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `StockCard.tsx`)
- Utilities/hooks: `camelCase.ts` (e.g., `useWatchlist.ts`)
- Actions: `kebab-case.actions.ts` (e.g., `watchlist.actions.ts`)
- Tests: Same name as file with `.test.ts` suffix

### Components

- Use shadcn/ui patterns with CVA (class-variance-authority)
- Follow compound component pattern for complex UI
- Props interface named `ComponentNameProps`

```typescript
// CVA variant pattern
const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", destructive: "..." },
    size: { default: "...", sm: "..." },
  },
  defaultVariants: { variant: "default", size: "default" },
});

// Export pattern
export { Button, buttonVariants };
```

### Error Handling

- Throw descriptive errors for validation failures
- Use `console.error` for logging failures in async operations
- Wrap API calls in try-catch with specific error messages

```typescript
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}

try {
  const result = await fetchData();
} catch (error) {
  console.error("Failed to fetch data:", error);
  throw new Error("Failed to fetch stock data");
}
```

### React Patterns

- Use `use client` directive for client components
- Server components preferred for data fetching
- Use `React.ComponentProps<"element">` for polymorphic components
- Prefer functional components with explicit return types for complex functions

### Utility Functions

- Create shared utilities in `lib/utils.ts`
- Export helper functions for consistent formatting (dates, currency, etc.)
- Use TypeScript type imports for better treeshaking

## Directory Structure

```
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes
│   ├── (dashboard)/       # Main app routes
│   └── api/              # API routes
├── components/
│   ├── ui/               # Base UI components (shadcn-style)
│   └── */                # Feature-specific components
├── lib/
│   ├── actions/          # Server actions (use server)
│   ├── ai-provider.ts    # AI provider abstraction
│   ├── utils.ts          # Shared utilities
│   ├── inngest/          # Background jobs
│   └── better-auth/      # Auth configuration
├── database/              # Database models
├── hooks/                 # Custom React hooks
├── middleware/            # Next.js middleware
├── public/                # Static assets
├── scripts/               # Utility scripts
└── __tests__/            # Integration/unit tests
```

## Key Libraries

| Library | Purpose |
|---------|---------|
| `@radix-ui/*` | Headless UI primitives |
| `lucide-react` | Icons |
| `sonner` | Toast notifications |
| `date-fns` | Date formatting |
| `better-auth` | Authentication |
| `mongoose` | MongoDB ODM |
| `inngest` | Background job processing |
| `react-hook-form` | Form handling |
| `tailwind-merge` + `clsx` | ClassName utilities |

## Environment Variables

Required variables for development:
- `DATABASE_URL` - MongoDB connection string
- `GEMINI_API_KEY` / `MINIMAX_API_KEY` / `SIRAY_API_KEY` - AI providers
- `BETTER_AUTH_SECRET` - Auth secret
- `EMAIL_*` - Nodemailer configuration

## Testing Guidelines

- Use Vitest globals: `describe`, `it`, `expect`, `vi`
- Mock global `fetch` with `vi.stubGlobal`
- Restore `process.env` in `afterEach` hooks
- Group tests by function with `describe` blocks
- Use descriptive test names: `"returns X when Y happens"`
