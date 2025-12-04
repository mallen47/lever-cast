/**
 * Template Database Service
 *
 * Handles all template-related database operations through Prisma.
 * Following database-integration rules: Use Prisma as the ONLY database client.
 */

import { prisma } from '@/lib/prisma';
import { Prisma, Platform, TemplateCategory } from '@prisma/client';

// =============================================================================
// TYPES
// =============================================================================

export type CreateTemplateInput = {
	userId?: string;
	name: string;
	description: string;
	category?: TemplateCategory;
	platformSupport?: Platform[];
	isSystem?: boolean;
};

export type UpdateTemplateInput = {
	name?: string;
	description?: string;
	category?: TemplateCategory | null;
	platformSupport?: Platform[];
};

export type GetTemplatesOptions = {
	userId?: string;
	category?: TemplateCategory;
	platform?: Platform;
	includeSystem?: boolean;
	skip?: number;
	take?: number;
};

// =============================================================================
// TEMPLATE OPERATIONS
// =============================================================================

/**
 * Create a new template
 */
export async function createTemplate(data: CreateTemplateInput) {
	return await prisma.template.create({
		data: {
			userId: data.userId,
			name: data.name,
			description: data.description,
			category: data.category,
			platformSupport: data.platformSupport ?? [],
			isSystem: data.isSystem ?? false,
		},
	});
}

/**
 * Get a single template by ID
 */
export async function getTemplateById(id: string) {
	return await prisma.template.findUnique({
		where: { id },
		include: {
			user: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});
}

/**
 * Get templates with filtering
 */
export async function getTemplates(options: GetTemplatesOptions) {
	const {
		userId,
		category,
		platform,
		includeSystem = true,
		skip = 0,
		take = 50,
	} = options;

	const where: Prisma.TemplateWhereInput = {
		OR: [
			// User's own templates
			...(userId ? [{ userId }] : []),
			// System templates if requested
			...(includeSystem ? [{ isSystem: true }] : []),
		],
		...(category && { category }),
		...(platform && { platformSupport: { has: platform } }),
	};

	// Handle case where no user and no system templates requested
	if (!userId && !includeSystem) {
		return { templates: [], total: 0 };
	}

	const [templates, total] = await Promise.all([
		prisma.template.findMany({
			where,
			skip,
			take,
			orderBy: [
				{ isSystem: 'desc' }, // System templates first
				{ name: 'asc' },
			],
		}),
		prisma.template.count({ where }),
	]);

	return { templates, total };
}

/**
 * Get templates for a specific user (including system templates)
 */
export async function getUserTemplates(userId: string) {
	return await prisma.template.findMany({
		where: {
			OR: [{ userId }, { isSystem: true }],
		},
		orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
	});
}

/**
 * Get system templates only
 */
export async function getSystemTemplates() {
	return await prisma.template.findMany({
		where: { isSystem: true },
		orderBy: { name: 'asc' },
	});
}

/**
 * Get templates by category
 */
export async function getTemplatesByCategory(
	category: TemplateCategory,
	userId?: string
) {
	return await prisma.template.findMany({
		where: {
			category,
			OR: [...(userId ? [{ userId }] : []), { isSystem: true }],
		},
		orderBy: { name: 'asc' },
	});
}

/**
 * Update a template
 */
export async function updateTemplate(id: string, data: UpdateTemplateInput) {
	try {
		return await prisma.template.update({
			where: { id },
			data: {
				...(data.name !== undefined && { name: data.name }),
				...(data.description !== undefined && {
					description: data.description,
				}),
				...(data.category !== undefined && { category: data.category }),
				...(data.platformSupport !== undefined && {
					platformSupport: data.platformSupport,
				}),
			},
		});
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2025') {
				throw new Error(`Template with id ${id} not found`);
			}
		}
		throw error;
	}
}

/**
 * Delete a template (only non-system templates)
 */
export async function deleteTemplate(id: string) {
	try {
		// First check if it's a system template
		const template = await prisma.template.findUnique({
			where: { id },
			select: { isSystem: true },
		});

		if (template?.isSystem) {
			throw new Error('Cannot delete system templates');
		}

		return await prisma.template.delete({
			where: { id },
		});
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2025') {
				throw new Error(`Template with id ${id} not found`);
			}
		}
		throw error;
	}
}

/**
 * Seed system templates (for initial setup)
 */
export async function seedSystemTemplates(
	templates: Omit<CreateTemplateInput, 'isSystem'>[]
) {
	const operations = templates.map((template) =>
		prisma.template.upsert({
			where: {
				id: `system-${template.name
					.toLowerCase()
					.replace(/\s+/g, '-')}`,
			},
			update: {
				name: template.name,
				description: template.description,
				category: template.category,
				platformSupport: template.platformSupport ?? [],
			},
			create: {
				id: `system-${template.name
					.toLowerCase()
					.replace(/\s+/g, '-')}`,
				name: template.name,
				description: template.description,
				category: template.category,
				platformSupport: template.platformSupport ?? [],
				isSystem: true,
			},
		})
	);

	return await prisma.$transaction(operations);
}
