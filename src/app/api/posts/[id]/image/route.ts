/**
 * Post Image Upload API Route
 *
 * POST /api/posts/[id]/image - Upload an image for a post
 */

import {
	getAuthenticatedUser,
	successResponse,
	unauthorizedResponse,
	forbiddenResponse,
	notFoundResponse,
	validationErrorResponse,
	internalErrorResponse,
} from '@/lib/api';
import { getPostById, updatePost } from '@/lib/services/db/post.service';

interface RouteParams {
	params: Promise<{ id: string }>;
}

// =============================================================================
// POST /api/posts/[id]/image
// =============================================================================

export async function POST(request: Request, { params }: RouteParams) {
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

		// Parse FormData
		const formData = await request.formData();
		const file = formData.get('image') as File | null;

		if (!file) {
			return validationErrorResponse('Image file is required');
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			return validationErrorResponse('File must be an image');
		}

		// Validate file size (max 10MB)
		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			return validationErrorResponse('Image size must be less than 10MB');
		}

		// TODO: Upload to Supabase Storage or other storage service
		// For now, we'll convert to base64 and store as data URL
		// In production, upload to Supabase Storage and get public URL
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const base64 = buffer.toString('base64');
		const dataUrl = `data:${file.type};base64,${base64}`;

		// Update post with image URL
		const updatedPost = await updatePost(id, {
			imageUrl: dataUrl,
		});

		return successResponse({
			imageUrl: updatedPost.imageUrl,
		});
	} catch (error) {
		console.error('Error uploading image:', error);
		return internalErrorResponse('Failed to upload image');
	}
}
