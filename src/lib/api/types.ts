/**
 * API Types
 *
 * Shared types for API requests and responses.
 */

import type { Platform, TemplateCategory } from '@prisma/client';

// =============================================================================
// ERROR TYPES
// =============================================================================

export type ApiErrorCode =
	| 'UNAUTHORIZED'
	| 'FORBIDDEN'
	| 'NOT_FOUND'
	| 'VALIDATION_ERROR'
	| 'CONFLICT'
	| 'INTERNAL_ERROR';

export interface ApiError {
	error: {
		code: ApiErrorCode;
		message: string;
		details?: Record<string, unknown>;
	};
}

// =============================================================================
// TEMPLATE TYPES
// =============================================================================

export interface PlatformPrompt {
	platformId: Platform;
	prompt: string;
}

export interface CreateTemplateRequest {
	name: string;
	description: string;
	category?: TemplateCategory;
	platformSupport: Platform[];
	platformPrompts: PlatformPrompt[];
}

export interface UpdateTemplateRequest {
	name?: string;
	description?: string;
	category?: TemplateCategory | null;
	platformSupport?: Platform[];
	platformPrompts?: PlatformPrompt[];
}

export interface TemplateResponse {
	id: string;
	userId: string | null;
	name: string;
	description: string;
	category: TemplateCategory | null;
	platformSupport: Platform[];
	platformPrompts: PlatformPrompt[];
	isSystem: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface TemplatesListResponse {
	templates: TemplateResponse[];
	total: number;
}

// =============================================================================
// PAGINATION TYPES
// =============================================================================

export interface PaginationParams {
	skip?: number;
	take?: number;
}

