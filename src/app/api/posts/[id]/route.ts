/**
 * Single Post API Routes
 *
 * GET /api/posts/[id] - Get a single post
 * PUT /api/posts/[id] - Update a post
 * DELETE /api/posts/[id] - Delete a post
 */

import { PostStatus } from '@prisma/client';
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
import type { Post } from '@/types';
import {
	getPostById,
	updatePost,
	deletePost,
} from '@/lib/services/db/post.service';

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Transform database post to API response format
 */
function toPostResponse(post: {
	id: string;
	userId: string;
	rawContent: string;
	platformContent: unknown;
	templateId: string | null;
	imageUrl: string | null;
	status: PostStatus;
	createdAt: Date;
	updatedAt: Date;
}): Post {
	return {
		id: post.id,
		rawContent: post.rawContent,
		platformContent: (post.platformContent as Record<string, string>) || {},
		templateId: post.templateId || undefined,
		imageUrl: post.imageUrl || undefined,
		status: post.status.toLowerCase() as Post['status'],
		createdAt: post.createdAt,
		updatedAt: post.updatedAt,
	};
}

/**
 * Validate post status
 */
function isValidStatus(value: string): value is PostStatus {
	return Object.values(PostStatus).includes(value.toUpperCase() as PostStatus);
}

interface RouteParams {
	params: Promise<{ id: string }>;
}

// =============================================================================
// GET /api/posts/[id]
// =============================================================================

export async function GET(request: Request, { params }: RouteParams) {
	try {
		const { id } = await params;

		// Authenticate user
		const { user, error } = await getAuthenticatedUser();
		if (!user) {
			return unauthorizedResponse(error || 'Authentication required');
		}

		// Get post
		const post = await getPostById(id);

		if (!post) {
			return notFoundResponse('Post not found');
		}

		// Check ownership
		if (post.userId !== user.id) {
			return forbiddenResponse('Access denied to this post');
		}

		return successResponse(toPostResponse(post));
	} catch (error) {
		console.error('Error fetching post:', error);
		return internalErrorResponse('Failed to fetch post');
	}
}

// =============================================================================
// PUT /api/posts/[id]
// =============================================================================

export async function PUT(request: Request, { params }: RouteParams) {
	try {
		const { id } = await params;

		// Authenticate user
		const { user, error } = await getAuthenticatedUser();
		if (!user) {
			return unauthorizedResponse(error || 'Authentication required');
		}

		// Get existing post
		const existingPost = await getPostById(id);

		if (!existingPost) {
			return notFoundResponse('Post not found');
		}

		// Check ownership
		if (existingPost.userId !== user.id) {
			return forbiddenResponse('Access denied to this post');
		}

		// Parse request body
		let body: {
			rawContent?: string;
			platformContent?: Record<string, string>;
			templateId?: string | null;
			imageUrl?: string | null;
			status?: string;
		};
		try {
			body = await request.json();
		} catch {
			return validationErrorResponse('Invalid JSON in request body');
		}

		// Validate fields if provided
		const validationErrors: Record<string, string> = {};

		if (body.rawContent !== undefined) {
			if (typeof body.rawContent !== 'string') {
				validationErrors.rawContent = 'Raw content must be a string';
			}
		}

		if (body.status !== undefined) {
			if (!isValidStatus(body.status)) {
				validationErrors.status = 'Invalid status value';
			}
		}

		if (Object.keys(validationErrors).length > 0) {
			return validationErrorResponse('Validation failed', {
				fields: validationErrors,
			});
		}

		// Prepare update data
		const updateData: {
			rawContent?: string;
			platformContent?: Record<string, string>;
			templateId?: string | null;
			imageUrl?: string | null;
			status?: PostStatus;
		} = {};

		if (body.rawContent !== undefined) {
			updateData.rawContent = body.rawContent.trim();
		}
		if (body.platformContent !== undefined) {
			updateData.platformContent = body.platformContent;
		}
		if (body.templateId !== undefined) {
			updateData.templateId = body.templateId;
		}
		if (body.imageUrl !== undefined) {
			updateData.imageUrl = body.imageUrl;
		}
		if (body.status !== undefined) {
			updateData.status = body.status.toUpperCase() as PostStatus;
		}

		// Update post
		const updatedPost = await updatePost(id, updateData);

		return successResponse(toPostResponse(updatedPost));
	} catch (error) {
		console.error('Error updating post:', error);
		return internalErrorResponse('Failed to update post');
	}
}

// =============================================================================
// DELETE /api/posts/[id]
// =============================================================================

export async function DELETE(request: Request, { params }: RouteParams) {
	try {
		const { id } = await params;

		// Authenticate user
		const { user, error } = await getAuthenticatedUser();
		if (!user) {
			return unauthorizedResponse(error || 'Authentication required');
		}

		// Get existing post
		const existingPost = await getPostById(id);

		if (!existingPost) {
			return notFoundResponse('Post not found');
		}

		// Check ownership
		if (existingPost.userId !== user.id) {
			return forbiddenResponse('Access denied to this post');
		}

		// Delete post
		await deletePost(id);

		return noContentResponse();
	} catch (error) {
		console.error('Error deleting post:', error);
		return internalErrorResponse('Failed to delete post');
	}
}

