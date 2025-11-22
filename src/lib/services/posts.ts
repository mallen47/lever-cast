/**
 * Posts service
 * Abstracts post data fetching logic from components
 * In production, this will call an API
 */

import {
	getAllPosts,
	getPostsByStatus,
	getPostById,
	searchPosts,
} from '@/lib/mock-data/posts';
import type { Post, PostStatus } from '@/types';

/**
 * Get all posts
 */
export async function fetchPosts(): Promise<Post[]> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 300));
	return getAllPosts();
}

/**
 * Get posts by status
 */
export async function fetchPostsByStatus(status: PostStatus): Promise<Post[]> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 300));
	return getPostsByStatus(status);
}

/**
 * Get post by ID
 */
export async function fetchPostById(id: string): Promise<Post | undefined> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 200));
	return getPostById(id);
}

/**
 * Search posts
 */
export async function searchPostsByQuery(query: string): Promise<Post[]> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 300));
	return searchPosts(query);
}

/**
 * Delete post (mock)
 */
export async function deletePost(id: string): Promise<void> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 500));
	// In production, this would call an API
	console.log('Post deleted:', id);
}

/**
 * Publish post (mock)
 */
export async function publishPost(id: string): Promise<void> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 1000));
	// In production, this would call an API
	console.log('Post published:', id);
}
