/**
 * Templates API Client
 *
 * Client-side functions for interacting with the templates API.
 */

import type {
	Template,
	TemplateFormData,
	PlatformPrompt,
} from '@/types/templates';
import type { PlatformId } from '@/types/platforms';

// =============================================================================
// TYPES
// =============================================================================

interface ApiError {
	error: {
		code: string;
		message: string;
		details?: Record<string, unknown>;
	};
}

interface TemplatesListResponse {
	templates: ApiTemplate[];
	total: number;
}

interface ApiTemplate {
	id: string;
	userId: string | null;
	name: string;
	description: string;
	category: string | null;
	platformSupport: string[];
	platformPrompts: Array<{ platformId: string; prompt: string }>;
	isSystem: boolean;
	createdAt: string;
	updatedAt: string;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Transform API template response to frontend Template type
 */
function toTemplate(apiTemplate: ApiTemplate): Template {
	return {
		id: apiTemplate.id,
		userId: apiTemplate.userId,
		name: apiTemplate.name,
		description: apiTemplate.description,
		category: apiTemplate.category as Template['category'],
		platformSupport: apiTemplate.platformSupport as PlatformId[],
		platformPrompts: apiTemplate.platformPrompts as PlatformPrompt[],
		isSystem: apiTemplate.isSystem,
		createdAt: new Date(apiTemplate.createdAt),
		updatedAt: new Date(apiTemplate.updatedAt),
	};
}

/**
 * Handle API response and throw on error
 */
async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const errorData: ApiError = await response.json().catch(() => ({
			error: {
				code: 'UNKNOWN_ERROR',
				message: 'An unexpected error occurred',
			},
		}));
		throw new Error(errorData.error.message);
	}

	// Handle 204 No Content
	if (response.status === 204) {
		return undefined as T;
	}

	return response.json();
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Fetch all templates for the current user (including system templates)
 */
export async function fetchTemplates(): Promise<Template[]> {
	const response = await fetch('/api/templates', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});

	const data = await handleResponse<TemplatesListResponse>(response);
	return data.templates.map(toTemplate);
}

/**
 * Fetch a single template by ID
 */
export async function fetchTemplate(id: string): Promise<Template> {
	const response = await fetch(`/api/templates/${id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});

	const data = await handleResponse<ApiTemplate>(response);
	return toTemplate(data);
}

/**
 * Create a new template
 */
export async function createTemplate(
	data: TemplateFormData
): Promise<Template> {
	const response = await fetch('/api/templates', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			name: data.name,
			description: data.description,
			category: data.category,
			platformSupport: data.platformSupport,
			platformPrompts: data.platformPrompts,
		}),
	});

	const result = await handleResponse<ApiTemplate>(response);
	return toTemplate(result);
}

/**
 * Update an existing template
 */
export async function updateTemplate(
	id: string,
	data: Partial<TemplateFormData>
): Promise<Template> {
	const response = await fetch(`/api/templates/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			...(data.name !== undefined && { name: data.name }),
			...(data.description !== undefined && {
				description: data.description,
			}),
			...(data.category !== undefined && { category: data.category }),
			...(data.platformSupport !== undefined && {
				platformSupport: data.platformSupport,
			}),
			...(data.platformPrompts !== undefined && {
				platformPrompts: data.platformPrompts,
			}),
		}),
	});

	const result = await handleResponse<ApiTemplate>(response);
	return toTemplate(result);
}

/**
 * Delete a template
 */
export async function deleteTemplate(id: string): Promise<void> {
	const response = await fetch(`/api/templates/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
	});

	await handleResponse<void>(response);
}
