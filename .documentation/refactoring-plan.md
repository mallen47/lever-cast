# Levercast Refactoring Plan

This document outlines a prioritized plan to address architectural issues, anti-patterns, and SOLID principle violations identified in the codebase assessment. Each phase includes specific tasks with proposed solutions designed for readability, maintainability, and extensibility.

> **Note**: This plan is designed for the prototype/design phase. Solutions use mock data and focus on establishing patterns that will scale when backend integration begins.

---

## Phase 1: Foundation - Type System & Constants

**Goal**: Establish a centralized type system and constants that serve as the single source of truth for domain models.

### 1.1 Create Centralized Type System

**Location**: `src/types/`

**Files to create**:

```
src/types/
├── index.ts          # Re-exports all types
├── platforms.ts      # Platform-related types
├── content.ts        # Content and post types
├── templates.ts      # Template types
└── user.ts           # User types
```

**Proposed Solution**:

```typescript
// src/types/platforms.ts
export const PLATFORMS = {
  LINKEDIN: 'linkedin',
  X: 'x',
} as const;

export type PlatformId = typeof PLATFORMS[keyof typeof PLATFORMS];

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  characterLimit?: number;
}

// src/types/content.ts
import { PlatformId } from './platforms';

export type PlatformContent = Partial<Record<PlatformId, string>>;

export interface Post {
  id: string;
  rawContent: string;
  platformContent: PlatformContent;
  templateId?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  // Platform-specific profile data
  platforms: {
    linkedin?: {
      headline: string;
    };
    x?: {
      handle: string;
    };
  };
}

// src/types/templates.ts
export interface Template {
  id: string;
  name: string;
  description: string;
  category?: string;
  platformSupport?: PlatformId[];
}
```

**Why this approach**:
- `as const` with derived types ensures type safety and enables exhaustive checks
- `Partial<Record<>>` allows dynamic platform support without breaking existing code
- Platform config includes all metadata needed for UI rendering
- User type anticipates multi-platform profile data

### 1.2 Create Platform Registry

**Location**: `src/lib/platforms/`

**Proposed Solution**:

```typescript
// src/lib/platforms/registry.ts
import { Linkedin } from 'lucide-react';
import { PlatformConfig, PLATFORMS } from '@/types';
import { XLogo } from '@/components/icons/XLogo';

export const platformRegistry: Record<PlatformId, PlatformConfig> = {
  [PLATFORMS.LINKEDIN]: {
    id: PLATFORMS.LINKEDIN,
    name: 'LinkedIn',
    icon: Linkedin,
    characterLimit: 3000,
  },
  [PLATFORMS.X]: {
    id: PLATFORMS.X,
    name: 'X',
    icon: XLogo,
    characterLimit: 280,
  },
};

// Helper functions
export function getPlatformConfig(id: PlatformId): PlatformConfig {
  return platformRegistry[id];
}

export function getAllPlatforms(): PlatformConfig[] {
  return Object.values(platformRegistry);
}
```

**Why this approach**:
- Adding a new platform = adding one entry to the registry
- All platform metadata in one place
- Type-safe lookups with helper functions

---

## Phase 2: State Management & Custom Hooks

**Goal**: Extract complex state logic from components into reusable, testable hooks.

### 2.1 Create usePostEditor Hook

**Location**: `src/hooks/use-post-editor.ts`

**Proposed Solution**:

```typescript
// src/hooks/use-post-editor.ts
import { useState, useCallback } from 'react';
import { PlatformId, PlatformContent, PLATFORMS } from '@/types';
import { generateFormattedContent } from '@/lib/services/content-generator';

interface UsePostEditorOptions {
  initialPlatforms?: PlatformId[];
}

interface UsePostEditorReturn {
  // State
  rawContent: string;
  platformContent: PlatformContent;
  selectedPlatforms: PlatformId[];
  selectedTemplate: string;
  imageUrl: string | undefined;
  isGenerating: boolean;
  error: string | null;

  // Actions
  setRawContent: (content: string) => void;
  setSelectedTemplate: (templateId: string) => void;
  togglePlatform: (platformId: PlatformId) => void;
  handleImageChange: (file: File | null) => void;
  generateContent: () => Promise<void>;
  clearError: () => void;
}

export function usePostEditor(options?: UsePostEditorOptions): UsePostEditorReturn {
  const [rawContent, setRawContent] = useState('');
  const [platformContent, setPlatformContent] = useState<PlatformContent>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(
    options?.initialPlatforms ?? [PLATFORMS.LINKEDIN, PLATFORMS.X]
  );
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePlatform = useCallback((platformId: PlatformId) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  }, []);

  const handleImageChange = useCallback((file: File | null) => {
    // Clean up previous URL to prevent memory leak
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    if (file) {
      setImageUrl(URL.createObjectURL(file));
    } else {
      setImageUrl(undefined);
    }
  }, [imageUrl]);

  const generateContent = useCallback(async () => {
    if (!rawContent.trim()) return;

    try {
      setError(null);
      setIsGenerating(true);

      const content = await generateFormattedContent(
        rawContent,
        selectedPlatforms,
        selectedTemplate
      );

      setPlatformContent(content);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  }, [rawContent, selectedPlatforms, selectedTemplate]);

  const clearError = useCallback(() => setError(null), []);

  return {
    rawContent,
    platformContent,
    selectedPlatforms,
    selectedTemplate,
    imageUrl,
    isGenerating,
    error,
    setRawContent,
    setSelectedTemplate,
    togglePlatform,
    handleImageChange,
    generateContent,
    clearError,
  };
}
```

**Why this approach**:
- All state logic in one testable unit
- Proper cleanup for Object URLs
- Error handling built-in
- Actions use `useCallback` for stable references
- Template selection now passed to generator

### 2.2 Create Service Layer Abstraction

**Location**: `src/lib/services/`

**Proposed Solution**:

```typescript
// src/lib/services/content-generator.ts
import { PlatformId, PlatformContent } from '@/types';

// This will call the API in production
export async function generateFormattedContent(
  rawContent: string,
  platforms: PlatformId[],
  templateId?: string
): Promise<PlatformContent> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock implementation - will be replaced with API call
  const content: PlatformContent = {};

  for (const platform of platforms) {
    content[platform] = formatForPlatform(rawContent, platform, templateId);
  }

  return content;
}

function formatForPlatform(
  content: string,
  platform: PlatformId,
  templateId?: string
): string {
  // Platform-specific formatting logic
  switch (platform) {
    case 'linkedin':
      return `${content}\n\n#professional #insights`;
    case 'x':
      return content.length > 280
        ? content.substring(0, 277) + '...'
        : content;
    default:
      return content;
  }
}

// src/lib/services/templates.ts
import { Template } from '@/types';
import { mockTemplates } from '@/lib/mock-data/templates';

export async function getTemplates(): Promise<Template[]> {
  // Will call API in production
  return mockTemplates;
}

export async function getTemplateById(id: string): Promise<Template | undefined> {
  // Will call API in production
  return mockTemplates.find(t => t.id === id);
}
```

**Why this approach**:
- Components depend on service interfaces, not implementations
- Easy to swap mock data for API calls
- Business logic isolated from UI
- Supports Dependency Inversion Principle

---

## Phase 3: Component Refactoring

**Goal**: Remove code duplication, improve component composition, and ensure Open/Closed compliance.

### 3.1 Consolidate Mock User Data

**Location**: `src/lib/mock-data/user.ts`

**Proposed Solution**:

```typescript
// src/lib/mock-data/user.ts
import { User } from '@/types';

export const mockUser: User = {
  id: '1',
  name: 'John Entrepreneur',
  email: 'john@example.com',
  avatar: 'JE',
  platforms: {
    linkedin: {
      headline: 'Founder & CEO | Tech Enthusiast',
    },
    x: {
      handle: '@johntech',
    },
  },
};
```

### 3.2 Create Shared Icons Directory

**Location**: `src/components/icons/`

**Tasks**:
1. Move `XLogo` from `PlatformSelector.tsx` to `src/components/icons/XLogo.tsx`
2. Remove duplicate SVG icons from preview components
3. Use lucide-react icons where possible

### 3.3 Refactor PreviewContainer for Extensibility

**Proposed Solution**:

```typescript
// src/components/content/PreviewContainer.tsx
import { PlatformId, PlatformContent } from '@/types';
import { platformRegistry } from '@/lib/platforms/registry';
import { LinkedInPreview } from '@/components/previews/LinkedInPreview';
import { XPreview } from '@/components/previews/XPreview';

// Preview component registry - add new platforms here
const PREVIEW_COMPONENTS: Record<PlatformId, React.ComponentType<PreviewProps>> = {
  linkedin: LinkedInPreview,
  x: XPreview,
};

interface PreviewContainerProps {
  content: PlatformContent;
  selectedPlatforms: PlatformId[];
  imageUrl?: string;
}

export function PreviewContainer({
  content,
  selectedPlatforms,
  imageUrl,
}: PreviewContainerProps) {
  return (
    <div className="space-y-4">
      {selectedPlatforms.map(platformId => {
        const PreviewComponent = PREVIEW_COMPONENTS[platformId];
        const config = platformRegistry[platformId];

        if (!PreviewComponent) return null;

        return (
          <div key={platformId}>
            <div className="flex items-center gap-2 mb-2">
              <config.icon className="h-4 w-4" />
              <span className="font-medium">{config.name}</span>
            </div>
            <PreviewComponent
              content={content[platformId] ?? ''}
              imageUrl={imageUrl}
            />
          </div>
        );
      })}
    </div>
  );
}
```

**Why this approach**:
- Adding a platform = adding one entry to `PREVIEW_COMPONENTS`
- Platform metadata comes from registry
- No prop changes needed for new platforms

### 3.4 Refactor PlatformSelector

**Proposed Solution**:

```typescript
// src/components/content/PlatformSelector.tsx
import { PlatformId } from '@/types';
import { getAllPlatforms } from '@/lib/platforms/registry';

interface PlatformSelectorProps {
  selectedPlatforms: PlatformId[];
  onToggle: (platformId: PlatformId) => void;
}

export function PlatformSelector({
  selectedPlatforms,
  onToggle,
}: PlatformSelectorProps) {
  const platforms = getAllPlatforms();

  return (
    <div className="flex gap-2">
      {platforms.map(platform => {
        const Icon = platform.icon;
        const isSelected = selectedPlatforms.includes(platform.id);

        return (
          <button
            key={platform.id}
            onClick={() => onToggle(platform.id)}
            className={/* styles based on isSelected */}
            aria-pressed={isSelected}
            aria-label={`${isSelected ? 'Deselect' : 'Select'} ${platform.name}`}
          >
            <Icon className="h-4 w-4" />
            <span>{platform.name}</span>
          </button>
        );
      })}
    </div>
  );
}
```

### 3.5 Update ContentInput to Use Button Component

Replace raw `<button>` with shadcn Button for consistency.

---

## Phase 4: Error Handling & Accessibility

**Goal**: Add robust error handling and improve accessibility across components.

### 4.1 Add Error Boundary

**Location**: `src/components/ErrorBoundary.tsx`

### 4.2 Create Toast/Alert System for Errors

Use existing shadcn components or add toast notifications for user feedback.

### 4.3 Add Accessibility Improvements

**Tasks**:
- Add `aria-label` to all engagement buttons in preview components
- Ensure proper focus management
- Add keyboard navigation support

### 4.4 Add Form Validation

**Location**: `src/lib/validation/`

```typescript
// src/lib/validation/image.ts
export const IMAGE_CONSTRAINTS = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

export function validateImage(file: File): { valid: boolean; error?: string } {
  if (!IMAGE_CONSTRAINTS.allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a valid image file' };
  }
  if (file.size > IMAGE_CONSTRAINTS.maxSize) {
    return { valid: false, error: 'Image must be less than 5MB' };
  }
  return { valid: true };
}
```

---

## Phase 5: Polish & Documentation

**Goal**: Final improvements for code quality and developer experience.

### 5.1 Add Page Metadata

Add SEO metadata to each page for better search engine visibility.

### 5.2 Standardize "use client" Directives

Audit all components and add directive consistently to interactive components.

### 5.3 Add Loading States

Create `loading.tsx` files for route segments.

### 5.4 Move Brand Colors to Theme

Add CSS variables for platform brand colors:

```css
:root {
  --color-linkedin: #0077b5;
  --color-x: #000000;
}
```

### 5.5 Update CLAUDE.md

Document new patterns:
- Type system usage
- Platform registry pattern
- Service layer conventions
- Hook patterns

---

## Implementation Order

| Order | Task | Estimated Complexity | Dependencies |
|-------|------|---------------------|--------------|
| 1 | Create type system (`src/types/`) | Low | None |
| 2 | Create platform registry | Low | Types |
| 3 | Create service layer | Medium | Types |
| 4 | Create `usePostEditor` hook | Medium | Types, Services |
| 5 | Consolidate mock user data | Low | Types |
| 6 | Create icons directory | Low | None |
| 7 | Refactor PreviewContainer | Medium | Registry, Types |
| 8 | Refactor PlatformSelector | Low | Registry |
| 9 | Update EditPostPage to use hook | Medium | Hook, Components |
| 10 | Add error handling | Medium | Hook |
| 11 | Add accessibility improvements | Low | None |
| 12 | Add validation | Low | None |
| 13 | Polish (metadata, loading states) | Low | None |

---

## Success Criteria

After completing this refactoring:

1. **Adding a new platform** requires only:
   - Adding type to `PlatformId`
   - Adding config to `platformRegistry`
   - Creating preview component
   - Adding to `PREVIEW_COMPONENTS` registry

2. **Switching from mock to API** requires only:
   - Updating service functions (no component changes)

3. **Testing** is straightforward:
   - Hooks can be tested in isolation
   - Services can be mocked
   - Components receive typed props

4. **Onboarding** is easier:
   - Types document the domain model
   - Patterns are consistent and documented
   - Single source of truth for platform data

---

## Notes for Future Phases

When moving to production:

- **State Management**: Consider Zustand for cross-page state persistence
- **Data Fetching**: Add React Query/SWR for server state caching
- **Authentication**: Integrate Clerk with protected route patterns
- **Database**: Align types with Prisma schema (can generate types from schema)
