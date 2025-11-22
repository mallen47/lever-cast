/**
 * Mock posts data
 * In production, these would be fetched from the database
 */

import type { Post, PostStatus } from '@/types';
import { PLATFORMS } from '@/types';

export const mockPosts: Post[] = [
	{
		id: '1',
		rawContent:
			'Just launched my new SaaS product! Excited to share this with everyone.',
		platformContent: {
			[PLATFORMS.LINKEDIN]:
				'🎉 Exciting News!\n\nJust launched my new SaaS product! Excited to share this with everyone.\n\nWhat are your thoughts? Let\'s discuss in the comments below! 👇\n\n#Entrepreneurship #Innovation #Business',
			[PLATFORMS.X]:
				'Just launched my new SaaS product! Excited to share this with everyone.',
		},
		templateId: '1',
		status: 'published',
		createdAt: new Date('2024-01-15T10:30:00Z'),
		updatedAt: new Date('2024-01-15T11:00:00Z'),
	},
	{
		id: '2',
		rawContent:
			'Quick tip: Always validate your product idea before building. Talk to potential customers first!',
		platformContent: {
			[PLATFORMS.LINKEDIN]:
				'💡 Quick Tip: Always validate your product idea before building. Talk to potential customers first!\n\nThis simple step can save you months of development time.\n\n#ProductDevelopment #StartupAdvice',
			[PLATFORMS.X]:
				'Quick tip: Always validate your product idea before building. Talk to potential customers first!',
		},
		templateId: '2',
		status: 'draft',
		createdAt: new Date('2024-01-20T14:15:00Z'),
		updatedAt: new Date('2024-01-20T14:15:00Z'),
	},
	{
		id: '3',
		rawContent:
			'Big news in the tech industry this week. AI is transforming how we work.',
		platformContent: {
			[PLATFORMS.LINKEDIN]:
				'📰 Industry News: Big news in the tech industry this week. AI is transforming how we work.\n\nWhat changes have you noticed in your industry?\n\n#TechNews #AI #Innovation',
			[PLATFORMS.X]:
				'Big news in the tech industry this week. AI is transforming how we work.',
		},
		templateId: '3',
		status: 'scheduled',
		createdAt: new Date('2024-01-22T09:00:00Z'),
		updatedAt: new Date('2024-01-22T09:00:00Z'),
	},
	{
		id: '4',
		rawContent:
			'Building in public has been one of the best decisions I\'ve made. The feedback is invaluable.',
		platformContent: {
			[PLATFORMS.LINKEDIN]:
				'🚀 Building in public has been one of the best decisions I\'ve made. The feedback is invaluable.\n\nTransparency builds trust and creates a community around your product.\n\n#BuildingInPublic #StartupLife',
		},
		templateId: '1',
		status: 'draft',
		createdAt: new Date('2024-01-25T16:45:00Z'),
		updatedAt: new Date('2024-01-25T16:45:00Z'),
	},
	{
		id: '5',
		rawContent:
			'Excited to announce our Series A funding round! Grateful for the support.',
		platformContent: {
			[PLATFORMS.LINKEDIN]:
				'🎊 Excited to announce our Series A funding round! Grateful for the support.\n\nThis milestone wouldn\'t be possible without our amazing team and investors.\n\n#StartupLife #Funding #Growth',
			[PLATFORMS.X]:
				'Excited to announce our Series A funding round! Grateful for the support.',
		},
		templateId: '1',
		status: 'published',
		createdAt: new Date('2024-01-10T08:00:00Z'),
		updatedAt: new Date('2024-01-10T08:00:00Z'),
	},
];

/**
 * Get all posts
 */
export function getAllPosts(): Post[] {
	return mockPosts.sort(
		(a, b) => b.createdAt.getTime() - a.createdAt.getTime()
	);
}

/**
 * Get posts by status
 */
export function getPostsByStatus(status: PostStatus): Post[] {
	return mockPosts
		.filter((post) => post.status === status)
		.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Get post by ID
 */
export function getPostById(id: string): Post | undefined {
	return mockPosts.find((post) => post.id === id);
}

/**
 * Search posts by content
 */
export function searchPosts(query: string): Post[] {
	const lowerQuery = query.toLowerCase();
	return mockPosts
		.filter(
			(post) =>
				post.rawContent.toLowerCase().includes(lowerQuery) ||
				Object.values(post.platformContent).some((content) =>
					content.toLowerCase().includes(lowerQuery)
				)
		)
		.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

