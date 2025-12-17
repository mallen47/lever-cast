/**
 * Posts service
 * Abstracts post data fetching logic from components
 * Calls the API endpoints
 */

import type { Post, PostStatus } from '@/types';

interface PostsListResponse {
	posts: Post[];
	total: number;
	hasMore: boolean;
}

/**
 * Transform API post response (with string dates) to Post type (with Date objects)
 */
function transformPost(
	post: Omit<Post, 'createdAt' | 'updatedAt'> & {
		createdAt: string;
		updatedAt: string;
	}
): Post {
	return {
		...post,
		createdAt: new Date(post.createdAt),
		updatedAt: new Date(post.updatedAt),
	};
}

/**
 * Get all posts
 */
export async function fetchPosts(): Promise<Post[]> {
	const response = await fetch('/api/posts', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		const error = await response
			.json()
			.catch(() => ({ error: { message: 'Failed to fetch posts' } }));
		throw new Error(error.error?.message || 'Failed to fetch posts');
	}

	const data = await response.json();
	return data.posts.map(transformPost);
}

/**
 * Get posts by status
 */
export async function fetchPostsByStatus(status: PostStatus): Promise<Post[]> {
	const response = await fetch(`/api/posts?status=${status}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		const error = await response
			.json()
			.catch(() => ({ error: { message: 'Failed to fetch posts' } }));
		throw new Error(error.error?.message || 'Failed to fetch posts');
	}

	const data = await response.json();
	return data.posts.map(transformPost);
}

/**
 * Get post by ID
 */
export async function fetchPostById(id: string): Promise<Post | undefined> {
	const response = await fetch(`/api/posts/${id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 404) {
			return undefined;
		}
		const error = await response
			.json()
			.catch(() => ({ error: { message: 'Failed to fetch post' } }));
		throw new Error(error.error?.message || 'Failed to fetch post');
	}

	const post = await response.json();
	return transformPost(post);
}

/**
 * Search posts
 */
export async function searchPostsByQuery(query: string): Promise<Post[]> {
	// For now, fetch all posts and filter client-side
	// In the future, we can add a search endpoint
	const allPosts = await fetchPosts();
	const lowerQuery = query.toLowerCase();
	return allPosts.filter(
		(post) =>
			post.rawContent.toLowerCase().includes(lowerQuery) ||
			Object.values(post.platformContent).some((content) =>
				content.toLowerCase().includes(lowerQuery)
			)
	);
}

/**
 * Create a new post (draft)
 */
export async function createPost(data: {
	rawContent: string;
	platformContent?: Record<string, string>;
	templateId?: string;
	imageUrl?: string;
	status?: PostStatus;
}): Promise<Post> {
	const response = await fetch('/api/posts', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			rawContent: data.rawContent,
			platformContent: data.platformContent || {},
			templateId: data.templateId,
			imageUrl: data.imageUrl,
			status: data.status || 'draft',
		}),
	});

	if (!response.ok) {
		const error = await response
			.json()
			.catch(() => ({ error: { message: 'Failed to create post' } }));
		throw new Error(error.error?.message || 'Failed to create post');
	}

	const post = await response.json();
	return transformPost(post);
}

/**
 * Update a post
 */
export async function updatePost(
	id: string,
	data: {
		rawContent?: string;
		platformContent?: Record<string, string>;
		templateId?: string | null;
		imageUrl?: string | null;
		status?: PostStatus;
	}
): Promise<Post> {
	const response = await fetch(`/api/posts/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response
			.json()
			.catch(() => ({ error: { message: 'Failed to update post' } }));
		throw new Error(error.error?.message || 'Failed to update post');
	}

	const post = await response.json();
	return transformPost(post);
}

/**
 * Delete post
 */
export async function deletePost(id: string): Promise<void> {
	const response = await fetch(`/api/posts/${id}`, {
		method: 'DELETE',
	});

	if (!response.ok) {
		const error = await response
			.json()
			.catch(() => ({ error: { message: 'Failed to delete post' } }));
		throw new Error(error.error?.message || 'Failed to delete post');
	}
}

/**
 * Publish post (updates status to published)
 */
export async function publishPost(id: string): Promise<Post> {
	return updatePost(id, { status: 'published' });
}

/**
 * Save draft (updates status to draft)
 */
export async function saveDraft(
	id: string,
	data: {
		rawContent?: string;
		platformContent?: Record<string, string>;
		templateId?: string | null;
		imageUrl?: string | null;
	}
): Promise<Post> {
	return updatePost(id, { ...data, status: 'draft' });
}

/**
 * Upload image for a post
 */
export async function uploadPostImage(
	postId: string,
	file: File
): Promise<{ imageUrl: string }> {
	const formData = new FormData();
	formData.append('image', file);

	const response = await fetch(`/api/posts/${postId}/image`, {
		method: 'POST',
		body: formData,
	});

	if (!response.ok) {
		const error = await response
			.json()
			.catch(() => ({ error: { message: 'Failed to upload image' } }));
		throw new Error(error.error?.message || 'Failed to upload image');
	}

	return await response.json();
}
