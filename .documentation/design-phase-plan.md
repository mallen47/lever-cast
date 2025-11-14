# Levercast Design Phase Plan

## Overview
This plan outlines the design and prototype phase for Levercast, focusing on frontend-only development with mock data, responsive UI, and complete navigation flow as per prototype phase guidelines.

## Design Principles (from UX Design Doc)
- **Dark Mode (Default):** Deep dark backgrounds with vibrant yellow accent color
- **Light Mode:** Clean light palette with same yellow accent for consistency
- **Layout:** Collapsible left sidebar + dynamic main content area
- **Typography:** Modern sans-serif (Geist already configured)
- **Accessibility:** High contrast, keyboard navigation, screen reader support

## Phase Breakdown

### Phase 1: Foundation & Layout (Priority: High)
**Goal:** Establish the core layout structure that all other components will use.

**Tasks:**
1. **Base Layout Component**
   - Create root layout with sidebar + main content area structure
   - Implement collapsible sidebar functionality
   - Set up theme provider (dark/light mode)
   - Configure yellow accent color in Tailwind theme

2. **Navigation Sidebar Component**
   - Menu items: New Post, Recent Posts, Settings, Templates
   - Profile icon at bottom with dropdown (logout option)
   - Collapse/expand toggle button
   - Active state indicators
   - Icons using lucide-react

3. **Theme Toggle Component**
   - Dark/light mode switcher
   - Persist preference (localStorage)
   - Smooth transitions

**Routes to Create:**
- `/dashboard` - Main dashboard/home
- `/edit-post` - Content creation
- `/posts` - Recent posts list
- `/settings` - Settings page
- `/templates` - Templates page

---

### Phase 2: Content Creation & Preview (Priority: High)
**Goal:** Build the core content creation experience with styled previews.

**Tasks:**
1. **Content Creation Screen (`/edit-post`)**
   - Large text input area (textarea) for raw content
   - Image upload UI (drag & drop + file picker)
   - Image preview component
   - Generate button (triggers mock LLM formatting)

2. **Styled Preview Components**
   - **LinkedIn Preview Component:**
     - Mimic LinkedIn post appearance
     - Profile section (avatar, name, headline)
     - Content area with formatting
     - Engagement buttons (Like, Comment, Share)
     - Dark/light mode variants
   
   - **Twitter Preview Component:**
     - Mimic Twitter/X post appearance
     - Profile header (avatar, name, handle)
     - Tweet content area
     - Engagement metrics (replies, retweets, likes)
     - Dark/light mode variants

3. **Inline Editing**
   - Make preview content editable
   - Real-time updates as user types
   - Save draft functionality (localStorage)

4. **Side-by-Side Layout**
   - Responsive grid: 2 columns on desktop, stacked on mobile
   - Scrollable preview panels

**Mock Data Needed:**
- Sample formatted content for LinkedIn and Twitter
- User profile data (name, avatar, headline)

---

### Phase 3: Content Management (Priority: Medium)
**Goal:** Allow users to view and manage their created content.

**Tasks:**
1. **Recent Posts Screen (`/posts`)**
   - List/grid view toggle
   - Post cards with:
     - Preview thumbnail
     - Title/snippet
     - Status badges (Draft, Pending, Published)
     - Timestamp
     - Quick actions (Edit, Delete, Publish)
   - Filter by status
   - Search functionality (mock)

2. **Post Detail View**
   - Full post view with all formatted versions
   - Edit button (navigates to `/edit-post` with data)
   - Status management
   - Publishing controls

**Mock Data Structure:**
```typescript
interface Post {
  id: string
  rawContent: string
  formattedContent: {
    linkedin: string
    twitter: string
  }
  imageUrl?: string
  status: 'draft' | 'pending' | 'published'
  createdAt: string
  updatedAt: string
  publishedAt?: string
}
```

---

### Phase 4: Settings & Templates (Priority: Medium)
**Goal:** Complete the navigation structure and provide configuration options.

**Tasks:**
1. **Settings Screen (`/settings`)**
   - Theme toggle (duplicate from header if needed)
   - User profile section (mock)
   - OAuth connection status (LinkedIn, Twitter)
   - Account preferences
   - Accessibility options

2. **Templates Screen (`/templates`)**
   - Grid/list of available templates
   - Template cards showing:
     - Template name
     - Description
     - Preview example
     - Use template button
   - Template categories (if applicable)

**Mock Data:**
- List of template objects with names, descriptions, and sample outputs

---

### Phase 5: Publishing & OAuth UI (Priority: Low)
**Goal:** Create the publishing interface (fully mocked, no actual OAuth).

**Tasks:**
1. **OAuth Connection UI**
   - Connection buttons for LinkedIn and Twitter
   - Status indicators (Connected/Not Connected)
   - Mock connection flow (shows success state)
   - Disconnect option

2. **Publishing Controls**
   - Platform selection checkboxes
   - Unified "Publish" button
   - Publishing status modal/notification
   - Success/error states (all mocked)

3. **Toast Notifications**
   - Install and configure Sonner (from tech stack)
   - Success/error/info toasts for user actions

---

### Phase 6: Polish & Responsiveness (Priority: High)
**Goal:** Ensure all components work well across screen sizes and meet accessibility standards.

**Tasks:**
1. **Responsive Design**
   - Mobile breakpoints for all screens
   - Sidebar behavior on mobile (overlay vs. always visible)
   - Stacked layouts for preview components
   - Touch-friendly button sizes

2. **Accessibility**
   - ARIA labels on all interactive elements
   - Keyboard navigation support
   - Focus states visible
   - Screen reader testing
   - Color contrast validation

3. **Animations & Transitions**
   - Smooth sidebar collapse/expand
   - Theme transition animations
   - Loading states for mock operations
   - Hover effects on interactive elements

---

## Mock Data Structure

### Posts Data (`src/lib/mock-data/posts.json`)
```json
{
  "posts": [
    {
      "id": "1",
      "rawContent": "Just launched my new SaaS product! Excited to share...",
      "formattedContent": {
        "linkedin": "🎉 Exciting News: I'm thrilled to announce the launch of my new SaaS product...",
        "twitter": "🚀 Just launched my new SaaS! Excited to share this with you all..."
      },
      "imageUrl": "/mock-images/post-1.jpg",
      "status": "published",
      "createdAt": "2024-01-15T10:30:00Z",
      "publishedAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

### Templates Data (`src/lib/mock-data/templates.json`)
```json
{
  "templates": [
    {
      "id": "1",
      "name": "Product Launch",
      "description": "Perfect for announcing new products or features",
      "category": "Business",
      "example": "🎉 Exciting announcement..."
    }
  ]
}
```

### User Profile Data (`src/lib/mock-data/user.json`)
```json
{
  "user": {
    "id": "1",
    "name": "John Entrepreneur",
    "email": "john@example.com",
    "avatar": "/mock-images/avatar.jpg",
    "headline": "Founder & CEO | Tech Enthusiast",
    "linkedinConnected": false,
    "twitterConnected": false
  }
}
```

---

## Component Structure (Following Cursor Rules)

```
src/
├── app/
│   ├── layout.tsx (root layout)
│   ├── page.tsx (redirect to /dashboard)
│   ├── dashboard/
│   │   └── page.tsx
│   ├── edit-post/
│   │   └── page.tsx
│   ├── posts/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   └── templates/
│       └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── MainLayout.tsx
│   │   └── ThemeToggle.tsx
│   ├── content/
│   │   ├── ContentInput.tsx
│   │   ├── ImageUpload.tsx
│   │   └── PreviewContainer.tsx
│   ├── previews/
│   │   ├── LinkedInPreview.tsx
│   │   └── TwitterPreview.tsx
│   ├── posts/
│   │   ├── PostCard.tsx
│   │   ├── PostList.tsx
│   │   └── PostStatusBadge.tsx
│   └── publishing/
│       ├── OAuthButton.tsx
│       ├── PlatformSelector.tsx
│       └── PublishButton.tsx
├── features/
│   ├── content-creation/
│   │   └── _components/
│   │       └── ContentEditor.tsx
│   └── posts/
│       └── _components/
│           └── PostFilters.tsx
├── lib/
│   ├── utils.ts (existing)
│   ├── mock-data/
│   │   ├── posts.json
│   │   ├── templates.json
│   │   └── user.json
│   └── hooks/
│       ├── useTheme.ts
│       └── usePosts.ts
└── components/ui/ (shadcn components)
    ├── Button.tsx
    ├── Card.tsx
    ├── Input.tsx
    ├── Textarea.tsx
    └── ... (other shadcn components as needed)
```

---

## Color Scheme Implementation

### Tailwind Theme Configuration
Update `globals.css` or create `tailwind.config.ts` with:

```css
/* Yellow accent color for dark mode */
--accent-yellow: #FFD700; /* or your preferred yellow */

/* Dark mode colors */
--background-dark: #0a0a0a;
--foreground-dark: #fafafa;

/* Light mode colors */
--background-light: #ffffff;
--foreground-light: #0a0a0a;
```

---

## Key Design Decisions

1. **Sidebar Behavior:**
   - Desktop: Collapsible, starts expanded
   - Mobile: Overlay/drawer, hidden by default

2. **Preview Layout:**
   - Desktop: Side-by-side (2 columns)
   - Tablet: Stacked vertically
   - Mobile: Single column, tabbed view

3. **State Management:**
   - React Context for theme
   - React Context for posts (mock data)
   - Local state for form inputs
   - localStorage for drafts and theme preference

4. **Mock LLM Response:**
   - Simulate API delay (500-1000ms)
   - Return pre-formatted content based on input keywords
   - Show loading state during "processing"

---

## Success Criteria

✅ All routes are accessible and navigable
✅ Sidebar collapses/expands smoothly
✅ Theme toggle works across all pages
✅ Content creation screen has full functionality (mock)
✅ Preview components accurately mimic LinkedIn and Twitter
✅ Recent posts screen displays mock data with status indicators
✅ All buttons and interactions are responsive
✅ Keyboard navigation works throughout
✅ Mobile responsive design implemented
✅ No console errors or warnings

---

## Next Steps After Design Phase

Once the prototype is complete and approved:
1. Set up authentication (Clerk)
2. Set up database (Prisma + Supabase)
3. Integrate real LLM API
4. Implement actual OAuth flows
5. Add real image upload/storage
6. Connect all mock data to real backend

---

## Estimated Timeline

- **Phase 1:** 2-3 days
- **Phase 2:** 3-4 days
- **Phase 3:** 2-3 days
- **Phase 4:** 1-2 days
- **Phase 5:** 1-2 days
- **Phase 6:** 2-3 days

**Total:** ~11-17 days for complete prototype

---

## Questions to Resolve

1. **Yellow Accent Shade:** What specific yellow hex code should we use? (e.g., #FFD700, #FFC107, #FBBF24)
2. **Sidebar Width:** What should be the default/collapsed widths?
3. **Image Upload:** Should we show image previews in the mock, or just the upload UI?
4. **Post Status Flow:** What triggers a post to move from "draft" → "pending" → "published"?
5. **Template Selection:** Should users select a template before or after entering content?

