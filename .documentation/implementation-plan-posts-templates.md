# Implementation Plan: Posts & Templates Integration

## Overview

This document captures the planned work for integrating posts with templates, including validation, UX improvements, and workflow changes.

---

## Requirements Summary

### Templates

-   A template can be associated with 0 or many posts
-   A template must be associated with at least 1 social media platform
-   A template can have associations to many social media platforms
-   No "default" template - instead, prompt user to create one when needed

### Posts

-   A post can be associated with only 1 template
-   Post CANNOT be published if no template is selected
-   Post CANNOT be published if content is empty
-   Post CAN be saved as draft without template or content
-   Platforms are determined by selected template but user can override

---

## Implementation Phases

### Phase 1: Platform Read-Only + Auto-Select Behavior ✅ COMPLETED

**Goal:** Platforms are disabled until template is selected, then auto-populated from template.

**Changes:**

1. `/edit-post` page:
    - Platform checkboxes are read-only (disabled) by default
    - When user selects a template:
        - Fetch template's `platformSupport` array
        - Auto-check those platforms
        - Enable checkboxes for user to override
    - If user changes template, re-apply the new template's platforms

**Files modified:**

-   `src/app/edit-post/page.tsx` - Added `handleTemplateChange` callback, wired up template and platform sync
-   `src/components/content/PlatformSelector.tsx` - Added `disabled` prop with visual feedback
-   `src/components/content/TemplateSelector.tsx` - Added `onTemplateChange` callback to emit full template object
-   `src/hooks/use-post-editor.ts` - Added `setPlatforms` function for bulk platform updates

---

### Phase 2: Publish Validation + Modals/Toasts

**Goal:** Prevent publishing without template or content, with appropriate user feedback.

**Validation Rules:**
| Condition | Action |
|-----------|--------|
| Publish clicked, no templates exist | Show "Create Template First" modal |
| Publish clicked, templates exist but none selected | Show toast: "Please select a template" |
| Publish clicked, content is empty | Show toast: "Please add content" |
| All valid | Proceed to publish |

**New Components:**

1. `CreateTemplatePromptModal` - Modal with:
    - Title: "Create a Template First"
    - Message: "Templates contain the prompts that help craft your posts."
    - Buttons: "Create Template" (→ /templates) | "Cancel"

**Files to modify/create:**

-   `src/components/posts/CreateTemplatePromptModal.tsx` (new)
-   `src/app/edit-post/page.tsx`
-   Add toast notifications (using sonner, already installed)

---

### Phase 3: Unsaved Changes Prompt

**Goal:** Prompt user to save draft if they navigate away with unsaved changes.

**Behavior:**

-   Track form "dirty" state (user has interacted with form)
-   On navigation attempt (route change, browser back, close tab):
    -   If dirty, show confirmation: "Save as draft?"
    -   Options: "Save Draft" | "Discard" | "Cancel"

**Implementation:**

-   Use `beforeunload` event for browser/tab close
-   Use Next.js router events for route changes
-   Track dirty state in form component

**Files to modify:**

-   `src/app/edit-post/page.tsx`
-   Possibly create `useUnsavedChangesWarning` hook

---

## Current State (Completed in This Session)

### Backend - Templates API

-   ✅ Created `/api/templates` routes (GET, POST)
-   ✅ Created `/api/templates/[id]` routes (GET, PUT, DELETE)
-   ✅ API auth with Clerk protection
-   ✅ Platform case normalization (lowercase ↔ uppercase)
-   ✅ Templates page connected to API (no more mock data)

### Database

-   ✅ Added `platformPrompts` JSON field to Template model
-   ✅ Set up proper migrations (baselined existing schema)
-   ✅ `_prisma_migrations` table created

### Auth

-   ✅ Webhook endpoint working with ngrok
-   ✅ Middleware updated to allow webhook routes
-   ✅ User creation/sync working end-to-end

---

## Files Reference

### API Routes

-   `src/app/api/templates/route.ts` - List/Create templates
-   `src/app/api/templates/[id]/route.ts` - Get/Update/Delete template

### Services

-   `src/lib/services/db/template.service.ts` - Database operations
-   `src/lib/services/api/templates.ts` - Client-side API calls

### Components

-   `src/components/templates/TemplateForm.tsx` - Create/edit template form
-   `src/components/templates/TemplateCard.tsx` - Template display card

### Pages

-   `src/app/templates/page.tsx` - Templates management page
-   `src/app/edit-post/page.tsx` - Post creation/editing (needs updates)
-   `src/app/posts/page.tsx` - Posts list

---

## How to Continue

When starting a new conversation, reference this file:

```
@.documentation/implementation-plan-posts-templates.md
```

Then say: "Let's continue with Phase X of the posts/templates implementation plan."
