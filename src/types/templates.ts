import type { PlatformId } from "./platforms";

/**
 * Platform-specific prompt configuration
 */
export interface PlatformPrompt {
  platformId: PlatformId;
  prompt: string;
}

/**
 * Content template for generating formatted posts
 */
export interface Template {
  id: string;
  name: string;
  description: string;
  category?: string;
  /** Platforms this template is optimized for */
  platformSupport: PlatformId[];
  /** Platform-specific prompts */
  platformPrompts: PlatformPrompt[];
  /** Whether this is a default/system template */
  isDefault?: boolean;
  /** Creation timestamp */
  createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Form data for creating/editing templates
 */
export interface TemplateFormData {
  name: string;
  description: string;
  platformSupport: PlatformId[];
  platformPrompts: PlatformPrompt[];
}

/**
 * Template categories for filtering/organization
 */
export type TemplateCategory = "Business" | "Tips" | "News" | "Personal" | "Marketing";
