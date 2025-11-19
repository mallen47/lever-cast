import type { PlatformId } from "./platforms";

/**
 * Content template for generating formatted posts
 */
export interface Template {
  id: string;
  name: string;
  description: string;
  category?: string;
  /** Platforms this template is optimized for */
  platformSupport?: PlatformId[];
}

/**
 * Template categories for filtering/organization
 */
export type TemplateCategory = "Business" | "Tips" | "News" | "Personal" | "Marketing";
