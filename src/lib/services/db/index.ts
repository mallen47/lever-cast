/**
 * Database Services
 *
 * Centralized exports for all database service functions.
 * Import from here: import { createUser, getPosts } from '@/lib/services/db'
 */

// User operations
export {
	createUser,
	getUserById,
	getUserByClerkId,
	getUserByEmail,
	updateUserByClerkId,
	deleteUserByClerkId,
	upsertPlatformProfile,
	getUserPlatformProfiles,
	deletePlatformProfile,
	type CreateUserInput,
	type UpdateUserInput,
	type CreatePlatformProfileInput,
} from './user.service';

// Post operations
export {
	createPost,
	getPostById,
	getPosts,
	getPostsByStatus,
	updatePost,
	updatePostStatus,
	deletePost,
	getPostCountsByStatus,
	type CreatePostInput,
	type UpdatePostInput,
	type GetPostsOptions,
} from './post.service';

// Template operations
export {
	createTemplate,
	getTemplateById,
	getTemplates,
	getUserTemplates,
	getSystemTemplates,
	getTemplatesByCategory,
	updateTemplate,
	deleteTemplate,
	seedSystemTemplates,
	type CreateTemplateInput,
	type UpdateTemplateInput,
	type GetTemplatesOptions,
} from './template.service';
