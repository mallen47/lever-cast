/**
 * Single Template API Routes
 *
 * GET    /api/templates/[id] - Get a single template
 * PUT    /api/templates/[id] - Update a template
 * DELETE /api/templates/[id] - Delete a template
 */

import { Platform, TemplateCategory } from '@prisma/client';
import {
	getAuthenticatedUser,
	successResponse,
	noContentResponse,
	unauthorizedResponse,
	forbiddenResponse,
	notFoundResponse,
	validationErrorResponse,
	internalErrorResponse,
} from '@/lib/api';
import type {
	UpdateTemplateRequest,
	TemplateResponse,
	PlatformPrompt,
} from '@/lib/api/types';
import {
	getTemplateById,
	updateTemplate,
	deleteTemplate,
} from '@/lib/services/db/template.service';

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Map frontend platform IDs (lowercase) to Prisma enum values (uppercase)
 */
const PLATFORM_MAP: Record<string, Platform> = {
	linkedin: Platform.LINKEDIN,
	x: Platform.X,
	LINKEDIN: Platform.LINKEDIN,
	X: Platform.X,
};

/**
 * Transform database template to API response format
 * Converts Prisma enum values back to lowercase for frontend
 */
function toTemplateResponse(template: {
	id: string;
	userId: string | null;
	name: string;
	description: string;
	category: TemplateCategory | null;
	platformSupport: Platform[];
	platformPrompts: unknown;
	isSystem: boolean;
	createdAt: Date;
	updatedAt: Date;
}): TemplateResponse {
	return {
		id: template.id,
		userId: template.userId,
		name: template.name,
		description: template.description,
		category: template.category,
		// Convert to lowercase for frontend compatibility
		platformSupport: template.platformSupport.map(p => p.toLowerCase()) as Platform[],
		platformPrompts: ((template.platformPrompts as PlatformPrompt[]) ?? []).map(p => ({
			...p,
			platformId: (p.platformId as string).toLowerCase() as Platform,
		})),
		isSystem: template.isSystem,
		createdAt: template.createdAt.toISOString(),
		updatedAt: template.updatedAt.toISOString(),
	};
}

/**
 * Validate and normalize platform value (handles both cases)
 */
function isValidPlatform(value: string): boolean {
	return value.toLowerCase() in PLATFORM_MAP || value.toUpperCase() in PLATFORM_MAP;
}

/**
 * Convert platform value to Prisma enum
 */
function toPrismaPlat(value: string): Platform {
	return PLATFORM_MAP[value] || PLATFORM_MAP[value.toUpperCase()];
}

/**
 * Validate category enum value
 */
function isValidCategory(value: string): value is TemplateCategory {
	return Object.values(TemplateCategory).includes(value as TemplateCategory);
}

/**
 * Validate platform prompts structure
 */
function validatePlatformPrompts(
	prompts: unknown
): prompts is Array<{ platformId: string; prompt: string }> {
	if (!Array.isArray(prompts)) return false;

	return prompts.every(
		(p) =>
			typeof p === 'object' &&
			p !== null &&
			'platformId' in p &&
			'prompt' in p &&
			typeof p.platformId === 'string' &&
			typeof p.prompt === 'string' &&
			isValidPlatform(p.platformId)
	);
}

interface RouteParams {
	params: Promise<{ id: string }>;
}

// =============================================================================
// GET /api/templates/[id]
// =============================================================================

export async function GET(request: Request, { params }: RouteParams) {
	try {
		const { id } = await params;

		// Authenticate user
		const { user, error } = await getAuthenticatedUser();
		if (!user) {
			return unauthorizedResponse(error || 'Authentication required');
		}

		// Get template
		const template = await getTemplateById(id);

		if (!template) {
			return notFoundResponse('Template not found');
		}

		// Check access: user can access their own templates or system templates
		if (!template.isSystem && template.userId !== user.id) {
			return forbiddenResponse('Access denied to this template');
		}

		return successResponse(toTemplateResponse(template));
	} catch (error) {
		console.error('Error fetching template:', error);
		return internalErrorResponse('Failed to fetch template');
	}
}

// =============================================================================
// PUT /api/templates/[id]
// =============================================================================

export async function PUT(request: Request, { params }: RouteParams) {
	try {
		const { id } = await params;

		// Authenticate user
		const { user, error } = await getAuthenticatedUser();
		if (!user) {
			return unauthorizedResponse(error || 'Authentication required');
		}

		// Get existing template
		const existingTemplate = await getTemplateById(id);

		if (!existingTemplate) {
			return notFoundResponse('Template not found');
		}

		// Check ownership: can't edit system templates or other users' templates
		if (existingTemplate.isSystem) {
			return forbiddenResponse('Cannot edit system templates');
		}

		if (existingTemplate.userId !== user.id) {
			return forbiddenResponse('Access denied to this template');
		}

		// Parse request body
		let body: UpdateTemplateRequest;
		try {
			body = await request.json();
		} catch {
			return validationErrorResponse('Invalid JSON in request body');
		}

		// Validate fields if provided
		const validationErrors: Record<string, string> = {};

		if (body.name !== undefined) {
			if (typeof body.name !== 'string' || !body.name.trim()) {
				validationErrors.name = 'Template name cannot be empty';
			}
		}

		if (body.description !== undefined) {
			if (typeof body.description !== 'string' || !body.description.trim()) {
				validationErrors.description = 'Description cannot be empty';
			}
		}

		if (body.platformSupport !== undefined) {
			if (!Array.isArray(body.platformSupport) || body.platformSupport.length === 0) {
				validationErrors.platformSupport = 'At least one platform is required';
			} else if (!body.platformSupport.every((p: string) => isValidPlatform(p))) {
				validationErrors.platformSupport = 'Invalid platform value';
			}
		}

		if (body.platformPrompts !== undefined) {
			if (!validatePlatformPrompts(body.platformPrompts)) {
				validationErrors.platformPrompts = 'Invalid platform prompts format';
			}
		}

		if (body.category !== undefined && body.category !== null) {
			if (!isValidCategory(body.category)) {
				validationErrors.category = 'Invalid category value';
			}
		}

		// Check that all selected platforms have prompts
		// Normalize to uppercase for comparison
		const finalPlatformSupport = body.platformSupport 
			? body.platformSupport.map((p: string) => p.toUpperCase())
			: existingTemplate.platformSupport;
		const finalPlatformPrompts = body.platformPrompts 
			? body.platformPrompts.map((p: { platformId: string; prompt: string }) => ({
					...p,
					platformId: p.platformId.toUpperCase(),
			  }))
			: (existingTemplate.platformPrompts as Array<{ platformId: string; prompt: string }>);

		if (finalPlatformSupport && finalPlatformPrompts) {
			const promptPlatforms = new Set(
				finalPlatformPrompts.map((p) => p.platformId.toUpperCase())
			);
			const missingPrompts = finalPlatformSupport.filter(
				(platform) => !promptPlatforms.has(platform.toUpperCase())
			);
			if (missingPrompts.length > 0) {
				validationErrors.platformPrompts = `Missing prompts for platforms: ${missingPrompts.join(', ')}`;
			}
		}

		if (Object.keys(validationErrors).length > 0) {
			return validationErrorResponse('Validation failed', {
				fields: validationErrors,
			});
		}

		// Convert platform values to Prisma enum format if provided
		const normalizedPlatformSupport = body.platformSupport
			? body.platformSupport.map((p: string) => toPrismaPlat(p))
			: undefined;
		const normalizedPlatformPrompts = body.platformPrompts
			? body.platformPrompts.map((p: { platformId: string; prompt: string }) => ({
					platformId: toPrismaPlat(p.platformId),
					prompt: p.prompt,
			  }))
			: undefined;

		// Update template
		const updatedTemplate = await updateTemplate(id, {
			name: body.name?.trim(),
			description: body.description?.trim(),
			category: body.category,
			platformSupport: normalizedPlatformSupport,
			platformPrompts: normalizedPlatformPrompts,
		});

		return successResponse(toTemplateResponse(updatedTemplate));
	} catch (error) {
		console.error('Error updating template:', error);
		return internalErrorResponse('Failed to update template');
	}
}

// =============================================================================
// DELETE /api/templates/[id]
// =============================================================================

export async function DELETE(request: Request, { params }: RouteParams) {
	try {
		const { id } = await params;

		// Authenticate user
		const { user, error } = await getAuthenticatedUser();
		if (!user) {
			return unauthorizedResponse(error || 'Authentication required');
		}

		// Get existing template
		const existingTemplate = await getTemplateById(id);

		if (!existingTemplate) {
			return notFoundResponse('Template not found');
		}

		// Check ownership: can't delete system templates or other users' templates
		if (existingTemplate.isSystem) {
			return forbiddenResponse('Cannot delete system templates');
		}

		if (existingTemplate.userId !== user.id) {
			return forbiddenResponse('Access denied to this template');
		}

		// Delete template
		await deleteTemplate(id);

		return noContentResponse();
	} catch (error) {
		console.error('Error deleting template:', error);
		return internalErrorResponse('Failed to delete template');
	}
}

