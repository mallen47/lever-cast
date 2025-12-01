# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Levercast is a social media content assistant that helps users capture, format, and share content ideas across multiple platforms (LinkedIn, X/Twitter, etc.). The project is currently in **prototype phase** with frontend-only implementation.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

The dev server runs with webpack mode (`--webpack` flag) and is available at http://localhost:3000.

## Prototype Phase Constraints

**IMPORTANT**: The project is in prototyping mode:

- Build frontend only - no backend integration
- Use mock data and static/dummy JSON for all data
- Link all components for navigation to demonstrate flow
- Ensure all UI controls are responsive
- Focus on design, UX, and component structure rather than production architecture

Mock data is stored in `src/lib/mock-data/` (e.g., `templates.ts`, `user.ts`).

## Technology Stack

- **Framework**: Next.js 16.0.1 (App Router)
- **React**: 19.2.0
- **Styling**: Tailwind CSS v4 with `tw-animate-css`
- **UI Components**: shadcn/ui (New York style, with CSS variables)
- **Icons**: lucide-react
- **State Management**: React Context (ThemeProvider for theme management)
- **Path Aliases**: `@/*` maps to `./src/*`

## File Structure

The codebase follows Next.js App Router conventions with a structured component hierarchy:

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with ThemeProvider
│   ├── page.tsx           # Redirects to /dashboard
│   ├── dashboard/
│   ├── posts/
│   ├── templates/
│   ├── settings/
│   └── edit-post/
├── components/
│   ├── ui/                # Base shadcn components (Button, Card, Input, Select, etc.)
│   ├── icons/             # Custom icon components (XLogo)
│   ├── layout/            # Layout components (MainLayout, Sidebar, ThemeToggle)
│   ├── content/           # Content-related components (ContentInput, ImageUpload, TemplateSelector, etc.)
│   └── previews/          # Platform-specific preview components (LinkedInPreview, XPreview)
├── hooks/                  # Custom React hooks (usePostEditor)
├── lib/
│   ├── platforms/         # Platform registry and configuration
│   ├── providers/         # React context providers (theme-provider.tsx)
│   ├── services/          # Service layer for data fetching abstractions
│   ├── mock-data/         # Mock data for prototype phase
│   └── utils.ts           # Utility functions (cn helper)
├── types/                  # Centralized TypeScript type definitions
└── public/                # Static assets
```

### Component Hierarchy Guidelines

- **src/ui/**: Base shadcn components (generic, reusable)
- **src/components/**: Composed reusable components
- **src/app/[route]/_components/**: Page-specific components (prefix with underscore)
- **src/features/**: Feature-specific components and logic (future use)

## Component Development Rules

- Always use `"use client"` directive for client-side components
- Use Tailwind CSS utility classes for all styling
- Prefer existing shadcn components over creating new ones
- Use lucide-react for all icons
- Components should be responsive using Tailwind breakpoints
- Add `aria-label` attributes to interactive elements for accessibility

## Type System

All shared types are centralized in `src/types/`. Import from here:

```typescript
import { PLATFORMS, PlatformId, User, Template, PlatformContent } from '@/types';
```

Use the `PLATFORMS` constant instead of magic strings for platform identifiers.

## Platform Registry

Platform configuration lives in `src/lib/platforms/registry.ts`. To add a new platform:

1. Add constant to `PLATFORMS` in `src/types/platforms.ts`
2. Add config to `platformRegistry` in `src/lib/platforms/registry.ts`
3. Create preview component in `src/components/previews/`
4. Add to `PREVIEW_COMPONENTS` in `PreviewContainer.tsx`

## Custom Hooks

Complex state is extracted into hooks in `src/hooks/`:

- **usePostEditor**: Manages post editor state (content, platforms, templates, images, generation)

## Service Layer

Data fetching is abstracted in `src/lib/services/`. Services return Promises and can be swapped from mock to API without changing components.

## Theme System

The app uses a custom theme system to avoid hydration mismatches:

1. **Blocking Script**: `src/app/layout.tsx` includes a blocking script that sets the theme class on `<html>` before React hydrates
2. **ThemeProvider**: `src/lib/providers/theme-provider.tsx` manages theme state using React Context
3. **Storage**: Theme preference is saved to localStorage
4. **Default**: Dark mode is the default theme

The `suppressHydrationWarning` attribute is used on `<html>` and `<body>` to prevent mismatches between server and client renders.

## Database Integration (Future)

When integrating a database (post-prototype):

- **ONLY use Prisma** as the database client
- NO direct database connections or alternative clients (e.g., Supabase client, raw SQL)
- Keep database logic in dedicated service layers under `src/services/`
- Use Prisma migrations for all schema changes
- Reference users by the User table `id` field, NOT `clerkId`
- Never expose Prisma client on client-side
- Use server components or API routes for database operations

Authentication will use Clerk, but all user data management must go through Prisma.

## Application Structure

- **Root page** (`/`): Redirects to `/dashboard`
- **Layout**: Uses `MainLayout` component with collapsible `Sidebar` and `ThemeToggle` in header
- **Navigation**: Dashboard, Posts, Templates, Settings, Edit Post
- **Content Flow**: Users can create content with platform selectors, template selectors, and platform-specific previews

## shadcn/ui Configuration

- Style: `new-york`
- Base color: `neutral`
- CSS variables enabled
- RSC (React Server Components) mode enabled
- Icon library: `lucide`
- Path aliases configured for `@/components`, `@/lib`, `@/ui`, etc.

## Key Implementation Details

- **Fonts**: Uses Geist Sans and Geist Mono from next/font
- **TypeScript**: Strict mode enabled, target ES2017
- **ESLint**: Configured with Next.js defaults
- **Webpack**: Development and build commands use explicit `--webpack` flag
