/**
 * Templates API Routes
 *
 * GET  /api/templates - List templates for current user (including system templates)
 * POST /api/templates - Create a new template
 */

import { Platform, TemplateCategory } from '@prisma/client';
import {
	getAuthenticatedUser,
	successResponse,
	createdResponse,
	unauthorizedResponse,
	validationErrorResponse,
	internalErrorResponse,
} from '@/lib/api';
import type {
	CreateTemplateRequest,
	TemplateResponse,
	TemplatesListResponse,
	PlatformPrompt,
} from '@/lib/api/types';
import {
	createTemplate,
	getUserTemplates,
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

// =============================================================================
// GET /api/templates
// =============================================================================

export async function GET() {
	try {
		// Authenticate user
		const { user, error } = await getAuthenticatedUser();
		if (!user) {
			return unauthorizedResponse(error || 'Authentication required');
		}

		// Get user's templates including system templates
		const templates = await getUserTemplates(user.id);

		const response: TemplatesListResponse = {
			templates: templates.map(toTemplateResponse),
			total: templates.length,
		};

		const nextResponse = successResponse(response);
		nextResponse.headers.set(
			'Cache-Control',
			'private, max-age=30, stale-while-revalidate=300'
		);

		return nextResponse;
	} catch (error) {
		console.error('Error fetching templates:', error);
		return internalErrorResponse('Failed to fetch templates');
	}
}

// =============================================================================
// POST /api/templates
// =============================================================================

export async function POST(request: Request) {
	try {
		// Authenticate user
		const { user, error } = await getAuthenticatedUser();
		if (!user) {
			return unauthorizedResponse(error || 'Authentication required');
		}

		// Parse request body
		let body: CreateTemplateRequest;
		try {
			body = await request.json();
		} catch {
			return validationErrorResponse('Invalid JSON in request body');
		}

		// Validate required fields
		const validationErrors: Record<string, string> = {};

		if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
			validationErrors.name = 'Template name is required';
		}

		if (
			!body.description ||
			typeof body.description !== 'string' ||
			!body.description.trim()
		) {
			validationErrors.description = 'Description is required';
		}

		if (!Array.isArray(body.platformSupport) || body.platformSupport.length === 0) {
			validationErrors.platformSupport = 'At least one platform is required';
		} else if (!body.platformSupport.every((p: string) => isValidPlatform(p))) {
			validationErrors.platformSupport = 'Invalid platform value';
		}

		if (!validatePlatformPrompts(body.platformPrompts)) {
			validationErrors.platformPrompts = 'Invalid platform prompts format';
		}

		// Validate category if provided
		if (body.category !== undefined && body.category !== null) {
			if (!isValidCategory(body.category)) {
				validationErrors.category = 'Invalid category value';
			}
		}

		// Check that all selected platforms have prompts (normalize to uppercase for comparison)
		if (Array.isArray(body.platformSupport) && Array.isArray(body.platformPrompts)) {
			const promptPlatforms = new Set(
				body.platformPrompts.map((p) => p.platformId.toUpperCase())
			);
			const missingPrompts = body.platformSupport.filter(
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

		// Convert platform values to Prisma enum format
		const normalizedPlatformSupport = body.platformSupport.map((p: string) => toPrismaPlat(p));
		const normalizedPlatformPrompts = body.platformPrompts.map((p: { platformId: string; prompt: string }) => ({
			platformId: toPrismaPlat(p.platformId),
			prompt: p.prompt,
		}));

		// Create template
		const template = await createTemplate({
			userId: user.id,
			name: body.name.trim(),
			description: body.description.trim(),
			category: body.category,
			platformSupport: normalizedPlatformSupport,
			platformPrompts: normalizedPlatformPrompts,
		});

		return createdResponse(toTemplateResponse(template));
	} catch (error) {
		console.error('Error creating template:', error);
		return internalErrorResponse('Failed to create template');
	}
}

