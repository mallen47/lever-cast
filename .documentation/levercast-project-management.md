# Levercast Project Management Documentation

## Task Management Instructions

-   Tasks are tagged as Done, ToDo or Backlog

## Completed Tasks

Tasks are ordered chronologically from top to bottom.

-   **Phase 1: Foundation & Layout**

    -   [x] Base Layout Component (Root layout with sidebar + main content area)
    -   [x] Navigation Sidebar Component (Collapsible, Menu items: New Post, Recent Posts, Settings, Templates)
    -   [x] Theme Toggle Component (Dark/Light mode switcher with persistence)
    -   [x] Route Creation (`/dashboard`, `/edit-post`, `/posts`, `/settings`, `/templates`)

-   **Phase 2: Content Creation & Preview**

    -   [x] Content Creation Screen (`/edit-post` with text input & image upload UI)
    -   [x] Image Upload Component (Drag & drop + file picker with preview)
    -   [x] Styled Preview Components (LinkedIn & Twitter post mimics)
    -   [x] Inline Editing (Real-time updates in preview panels)
    -   [x] Side-by-Side Layout (Responsive editor/preview split)

-   **Ad-hoc Improvements**
    -   [x] Confirmation Modal (Replaced browser alerts with styled `ConfirmationModal`)
    -   [x] Toast Notifications (Integrated Sonner for user feedback on actions)

## Pending Tasks

Tasks are prioritized by their order in the associated list.

-   **Phase 3: Content Management**

    -   [ ] Recent Posts Screen (`/posts`)
        -   List/grid view toggle
        -   Post cards with status badges (Draft, Pending, Published)
        -   Filter by status & Search functionality
    -   [ ] Post Detail View
        -   Full post view with formatted versions
        -   Status management & Publishing controls

-   **Phase 4: Settings & Templates**
    -   [ ] Templates Screen (`/templates`)
        -   Grid/list of available templates
        -   Template cards with preview & "Use template" action
    -   [ ] Settings Screen (`/settings`)
        -   User profile section (mock data)
        -   OAuth connection status & Account preferences

## Backlog Tasks

Tasks are prioritized by their order in the associated list.

-   **Phase 5: Publishing & OAuth UI**

    -   [ ] OAuth Connection UI (Mock connection flow for LinkedIn/Twitter)
    -   [ ] Publishing Controls (Platform selection, Unified publish button)
    -   [ ] Publishing Status Modals

-   **Phase 6: Polish & Responsiveness**

    -   [ ] Responsive Design Polish (Mobile breakpoints, Sidebar overlay)
    -   [ ] Accessibility Audit (ARIA labels, Keyboard nav, Contrast checks)
    -   [ ] Animations & Transitions (Sidebar smooth collapse, Theme fade)

-   **Backend Integration (Post-Prototype)**
    -   [ ] Authentication Setup (Clerk)
    -   [ ] Database Setup (Prisma + Supabase)
    -   [ ] Real LLM API Integration
    -   [ ] Real OAuth Implementation
    -   [ ] Image Storage Solution
