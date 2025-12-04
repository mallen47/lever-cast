/**
 * Post Database Service
 *
 * Handles all post-related database operations through Prisma.
 * Following database-integration rules: Use Prisma as the ONLY database client.
 */

import { prisma } from '@/lib/prisma';
import { Prisma, PostStatus } from '@prisma/client';

// =============================================================================
// TYPES
// =============================================================================

export type CreatePostInput = {
	userId: string;
	rawContent: string;
	platformContent?: Record<string, string>;
	templateId?: string;
	imageUrl?: string;
	status?: PostStatus;
};

export type UpdatePostInput = {
	rawContent?: string;
	platformContent?: Record<string, string>;
	templateId?: string | null;
	imageUrl?: string | null;
	status?: PostStatus;
};

export type GetPostsOptions = {
	userId: string;
	status?: PostStatus;
	skip?: number;
	take?: number;
	orderBy?: 'createdAt' | 'updatedAt';
	order?: 'asc' | 'desc';
};

// =============================================================================
// POST OPERATIONS
// =============================================================================

/**
 * Create a new post
 */
export async function createPost(data: CreatePostInput) {
	return await prisma.post.create({
		data: {
			userId: data.userId,
			rawContent: data.rawContent,
			platformContent: data.platformContent ?? {},
			templateId: data.templateId,
			imageUrl: data.imageUrl,
			status: data.status ?? 'DRAFT',
		},
		include: {
			template: true,
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					avatar: true,
				},
			},
		},
	});
}

/**
 * Get a single post by ID
 */
export async function getPostById(id: string) {
	return await prisma.post.findUnique({
		where: { id },
		include: {
			template: true,
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					avatar: true,
				},
			},
		},
	});
}

/**
 * Get posts with filtering and pagination
 */
export async function getPosts(options: GetPostsOptions) {
	const {
		userId,
		status,
		skip = 0,
		take = 20,
		orderBy = 'createdAt',
		order = 'desc',
	} = options;

	const where: Prisma.PostWhereInput = {
		userId,
		...(status && { status }),
	};

	const [posts, total] = await Promise.all([
		prisma.post.findMany({
			where,
			skip,
			take,
			orderBy: { [orderBy]: order },
			include: {
				template: true,
			},
		}),
		prisma.post.count({ where }),
	]);

	return {
		posts,
		total,
		hasMore: skip + posts.length < total,
	};
}

/**
 * Get posts by status for a user
 */
export async function getPostsByStatus(userId: string, status: PostStatus) {
	return await prisma.post.findMany({
		where: { userId, status },
		orderBy: { updatedAt: 'desc' },
		include: {
			template: true,
		},
	});
}

/**
 * Update a post
 */
export async function updatePost(id: string, data: UpdatePostInput) {
	try {
		return await prisma.post.update({
			where: { id },
			data: {
				...(data.rawContent !== undefined && {
					rawContent: data.rawContent,
				}),
				...(data.platformContent !== undefined && {
					platformContent: data.platformContent,
				}),
				...(data.templateId !== undefined && {
					templateId: data.templateId,
				}),
				...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
				...(data.status !== undefined && { status: data.status }),
			},
			include: {
				template: true,
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						avatar: true,
					},
				},
			},
		});
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2025') {
				throw new Error(`Post with id ${id} not found`);
			}
		}
		throw error;
	}
}

/**
 * Update post status
 */
export async function updatePostStatus(id: string, status: PostStatus) {
	return await updatePost(id, { status });
}

/**
 * Delete a post
 */
export async function deletePost(id: string) {
	try {
		return await prisma.post.delete({
			where: { id },
		});
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2025') {
				throw new Error(`Post with id ${id} not found`);
			}
		}
		throw error;
	}
}

/**
 * Get post count by status for a user
 */
export async function getPostCountsByStatus(userId: string) {
	const counts = await prisma.post.groupBy({
		by: ['status'],
		where: { userId },
		_count: true,
	});

	return counts.reduce(
		(acc, curr) => ({
			...acc,
			[curr.status]: curr._count,
		}),
		{} as Record<PostStatus, number>
	);
}
