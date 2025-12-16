/**
 * Posts API Routes
 *
 * GET  /api/posts - List posts for current user
 * POST /api/posts - Create a new post (draft)
 */

import { PostStatus } from '@prisma/client';
import {
	getAuthenticatedUser,
	successResponse,
	createdResponse,
	unauthorizedResponse,
	validationErrorResponse,
	internalErrorResponse,
} from '@/lib/api';
import { getPosts, createPost } from '@/lib/services/db/post.service';
import type { Post } from '@/types';

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

// =============================================================================
// GET /api/posts
// =============================================================================

export async function GET(request: Request) {
	try {
		// Authenticate user
		const { user, error } = await getAuthenticatedUser();
		if (!user) {
			return unauthorizedResponse(error || 'Authentication required');
		}

		// Parse query parameters
		const { searchParams } = new URL(request.url);
		const status = searchParams.get('status');
		const skip = parseInt(searchParams.get('skip') || '0', 10);
		const take = parseInt(searchParams.get('take') || '20', 10);
		const orderBy = (searchParams.get('orderBy') || 'createdAt') as 'createdAt' | 'updatedAt';
		const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

		// Validate status if provided
		let postStatus: PostStatus | undefined;
		if (status && status !== 'all') {
			if (!isValidStatus(status)) {
				return validationErrorResponse('Invalid status value');
			}
			postStatus = status.toUpperCase() as PostStatus;
		}

		// Get posts
		const result = await getPosts({
			userId: user.id,
			status: postStatus,
			skip,
			take,
			orderBy,
			order,
		});

		return successResponse({
			posts: result.posts.map(toPostResponse),
			total: result.total,
			hasMore: result.hasMore,
		});
	} catch (error) {
		console.error('Error fetching posts:', error);
		return internalErrorResponse('Failed to fetch posts');
	}
}

// =============================================================================
// POST /api/posts
// =============================================================================

export async function POST(request: Request) {
	try {
		// Authenticate user
		const { user, error } = await getAuthenticatedUser();
		if (!user) {
			return unauthorizedResponse(error || 'Authentication required');
		}

		// Parse request body
		let body: {
			rawContent: string;
			platformContent?: Record<string, string>;
			templateId?: string;
			imageUrl?: string;
			status?: string;
		};
		try {
			body = await request.json();
		} catch {
			return validationErrorResponse('Invalid JSON in request body');
		}

		// Validate required fields
		const validationErrors: Record<string, string> = {};

		if (!body.rawContent || typeof body.rawContent !== 'string') {
			validationErrors.rawContent = 'Raw content is required';
		}

		// Validate status if provided
		let postStatus: PostStatus = PostStatus.DRAFT;
		if (body.status !== undefined) {
			if (!isValidStatus(body.status)) {
				validationErrors.status = 'Invalid status value';
			} else {
				postStatus = body.status.toUpperCase() as PostStatus;
			}
		}

		if (Object.keys(validationErrors).length > 0) {
			return validationErrorResponse('Validation failed', {
				fields: validationErrors,
			});
		}

		// Create post
		const post = await createPost({
			userId: user.id,
			rawContent: body.rawContent.trim(),
			platformContent: body.platformContent || {},
			templateId: body.templateId,
			imageUrl: body.imageUrl,
			status: postStatus,
		});

		return createdResponse(toPostResponse(post));
	} catch (error) {
		console.error('Error creating post:', error);
		return internalErrorResponse('Failed to create post');
	}
}

