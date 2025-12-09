import type { PlatformId } from './platforms';

/**
 * Template categories for filtering/organization
 * Matches Prisma TemplateCategory enum
 */
export type TemplateCategory =
	| 'BUSINESS'
	| 'TIPS'
	| 'NEWS'
	| 'PERSONAL'
	| 'MARKETING';

/**
 * Category display names for UI
 */
export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
	BUSINESS: 'Business',
	TIPS: 'Tips',
	NEWS: 'News',
	PERSONAL: 'Personal',
	MARKETING: 'Marketing',
};

/**
 * All available template categories
 */
export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
	'BUSINESS',
	'TIPS',
	'NEWS',
	'PERSONAL',
	'MARKETING',
];

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
	userId: string | null;
	name: string;
	description: string;
	category: TemplateCategory | null;
	/** Platforms this template is optimized for */
	platformSupport: PlatformId[];
	/** Platform-specific prompts */
	platformPrompts: PlatformPrompt[];
	/** Whether this is a system template */
	isSystem: boolean;
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
	category: TemplateCategory | null;
	platformSupport: PlatformId[];
	platformPrompts: PlatformPrompt[];
}
